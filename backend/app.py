import os
from flask import Flask, request, jsonify
from clients.supabase_client import supabase
from chains.embedding import embed_and_store
from chains.sentiment import analyze_sentiment
from chains.classification import classify_review
from chains.topic import extract_and_store_topics
from chains.summary import generate_and_store_weekly_summary
from flask_cors import CORS
import logging 

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

CORS(app) 

@app.route("/webhook/reviews", methods=["POST"])
def webhook_reviews():
    logging.info("Received webhook request")
    try:
        payload = request.get_json()
        if not payload:
            logging.error("Webhook received empty payload")
            return jsonify({"error": "Empty payload"}), 400

        required_fields = ["id", "text", "review_date"]
        if not all(field in payload for field in required_fields):
             missing = [f for f in required_fields if f not in payload]
             logging.error(f"Webhook missing required fields: {missing}")
             return jsonify({"error": f"Missing fields: {missing}"}), 400

        review_id   = payload["id"]
        text        = payload["text"]
        review_date = payload["review_date"]
        metadata    = payload.get("metadata", {}) 

        logging.info(f"Processing review ID: {review_id}")

        insert_response = supabase.table("reviews").insert({
            "id":          review_id,
            "text":        text,
            "review_date": review_date,
            "metadata":    metadata
        }).execute()

        logging.info(f"Stored raw review {review_id} in Supabase.")

        embed_and_store(review_id, text, metadata)
        analyze_sentiment(review_id, text)
        classify_review(review_id, text, buckets="Service,Location,Product") 

        logging.info(f"Finished processing chains for review {review_id}")
        return jsonify({"status": "ok"}), 200

    except Exception as e:
        logging.error(f"Unhandled error in webhook_reviews: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/tasks/run-topic-extraction", methods=["POST"])
def run_topic_extraction_task():
    """
    Manually triggers the topic extraction process.
    In production, this would be called by a scheduler (e.g., daily).
    """
    logging.info("Received request to run topic extraction.")
    try:

        extract_and_store_topics()
        logging.info("Topic extraction task completed successfully.")
        return jsonify({"status": "ok", "message": "Topic extraction started."}), 200
    except Exception as e:
        logging.error(f"Error during topic extraction task: {e}", exc_info=True)
        return jsonify({"status": "error", "message": "Topic extraction failed."}), 500

@app.route("/tasks/run-weekly-summary", methods=["POST"])
def run_weekly_summary_task():
    """
    Manually triggers the weekly summary generation and storage.
    """
    logging.info("Received request to run weekly summary.")
    try:
        summary_text = generate_and_store_weekly_summary()

        if summary_text:
            logging.info("Weekly summary generation and storage task completed successfully.")
            return jsonify({"status": "ok", "message": "Weekly summary generated and stored."}), 200
        else:
             logging.warning("Weekly summary generation returned no text.")
             return jsonify({"status": "ok", "message": "Weekly summary generation complete (no text generated or stored)."}), 200
    except Exception as e:
        logging.error(f"Error during weekly summary task: {e}", exc_info=True)
        return jsonify({"status": "error", "message": "Weekly summary task failed."}), 500
    
@app.route("/")
def health_check():
    logging.info("Health check endpoint hit")
    return jsonify({"status": "ok", "message": "Backend is running"}), 200



if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080)) 
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "False") == "True")
