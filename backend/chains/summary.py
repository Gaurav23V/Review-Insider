from datetime import datetime, timedelta
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from clients.supabase_client import supabase
from clients.gemini_llm import GeminiLLM
import logging # Add logging

logging.basicConfig(level=logging.INFO)

PROMPT = PromptTemplate(
    template=(
        "Generate a weekly summary report of the following customer reviews. "
        "Format the output as clean Markdown. " # Added formatting instruction
        "Include: Good vs. Bad breakdown (with counts), key positive phrases, "
        "key negative phrases, and 3-5 actionable insights or recommendations. "
        "Reviews:\n\n{context}"
    ),
    input_variables=["context"],
)

llm = GeminiLLM(model="gemini-2.0-flash") # Or a more capable model if needed

def generate_and_store_weekly_summary(): # Renamed function slightly
    """
    Fetches last 7 days of reviews, runs LLM chain,
    stores the summary text in Supabase, and returns the text.
    """
    summary_text = None # Initialize
    try:
        week_ago = datetime.utcnow() - timedelta(days=7)
        resp = supabase.table("reviews") \
            .select("text") \
            .gte("created_at", week_ago.isoformat()) \
            .execute()

        if not hasattr(resp, 'data') or not resp.data:
            logging.warning("No reviews found in the last 7 days for weekly summary.")
            return None # Return None if no reviews

        texts = [r["text"] for r in resp.data]
        context = "\n".join(f"- {t}" for t in texts)

        chain = LLMChain(llm=llm, prompt=PROMPT)
        summary_text = chain.run(context=context) # Generate the summary

        if summary_text:
            logging.info("Generated weekly summary text.")
            # Store the generated summary in the new table
            insert_resp = supabase.table("weekly_summaries").insert({
                "summary_text": summary_text
                # generated_at defaults to now()
            }).execute()
            logging.info("Stored weekly summary in Supabase.")
            # Optional: Check insert_resp for errors
        else:
            logging.warning("LLM did not generate a summary text.")

    except Exception as e:
        logging.error(f"Error generating or storing weekly summary: {e}", exc_info=True)
        # Return None or re-raise depending on desired behavior

    return summary_text # Return the generated text (or None)
