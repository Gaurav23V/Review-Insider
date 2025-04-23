# backend/chains/topic.py

import json
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from clients.pinecone_client import query_similar
from clients.supabase_client import supabase
from clients.gemini_llm import GeminiLLM
import logging
import re

logging.basicConfig(level=logging.INFO)

# Extract top 5 themes from a blob of reviews
PROMPT = PromptTemplate(
    template=(
        "Analyze the following customer reviews:\n\n{context}\n\n"
        "Identify the top {k} distinct themes or topics mentioned. "
        "Respond with ONLY a valid JSON list of strings representing these themes, "
        "without any introductory text, explanation, or markdown formatting."
        # Example format: ["Theme 1", "Theme 2", "Theme 3"]
    ),
    input_variables=["context", "k"],
)

llm = GeminiLLM(model="gemini-2.0-flash")


def extract_and_store_topics(k: int = 5, sample_size: int = 50):
    """
    1) Fetch recent reviews for context
    2) Build prompt + run chain
    3) Clean LLM output and parse JSON
    4) Store each topic in Supabase.topics with all review IDs
    """
    try:
        # 1) fetch sample reviews
        resp = supabase.table("reviews").select("id,text").limit(sample_size).execute()
        if not hasattr(resp, 'data'):
             logging.error(f"Failed to fetch reviews for topic extraction. Response: {resp}")
             return
        rows = resp.data
        if not rows:
            logging.info("No reviews found for topic extraction.")
            return
        context = "\n".join(f"- {r['text']}" for r in rows)
        review_ids = [r["id"] for r in rows]

        # 2) run LLMChain for topics
        chain = LLMChain(llm=llm, prompt=PROMPT)
        raw_output = chain.run(context=context, k=str(k)) # Get raw output first
        logging.info(f"Raw topic output from LLM: {raw_output}")

        # --- ADD CLEANING STEP ---
        # Remove potential markdown fences and surrounding whitespace
        # Regex looks for optional ```json\n at start and \n``` at end
        cleaned_output = re.sub(r"^\s*```json\s*|\s*```\s*$", "", raw_output).strip()
        logging.info(f"Cleaned topic output for JSON parsing: {cleaned_output}")
        # --- END CLEANING STEP ---

        # 3) Parse JSON
        try:
            topics = json.loads(cleaned_output) # Parse the cleaned string
            if not isinstance(topics, list) or not all(isinstance(t, str) for t in topics):
                raise ValueError("Parsed data is not a list of strings")
        except (json.JSONDecodeError, ValueError) as e:
            logging.error(f"Failed to parse cleaned topics JSON: {e}. Cleaned output was: {cleaned_output}")
            return # Skip storing topics if parsing fails

        # 4) store topics
        logging.info(f"Extracted topics: {topics}")
        if not topics:
             logging.warning("No topics extracted after parsing.")
             return

        for label in topics:
            # Basic check to avoid empty strings if LLM returns them
            if label and label.strip():
                supabase.table("topics").insert({
                    "label": label.strip(),
                    "review_ids": review_ids,
                }).execute()
        logging.info(f"Stored {len(topics)} topics in Supabase.")

    except Exception as e:
        logging.error(f"Error in extract_and_store_topics: {e}", exc_info=True)



