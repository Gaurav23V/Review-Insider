# backend/chains/sentiment.py

import json
from clients.supabase_client import supabase
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from clients.gemini_llm import GeminiLLM
import logging # Add logging

logging.basicConfig(level=logging.INFO)

# 1–5 scale + one-sentence summary
PROMPT = PromptTemplate(
    template=(
        "Rate the sentiment of this customer review on a scale 1–5 "
        "(1=very negative, 5=very positive), then give a one-sentence "
        "tone summary in JSON. Review: \"{text}\". "
        "Output JSON with keys: score, summary."
    ),
    input_variables=["text"],
)

llm = GeminiLLM(model="gemini-2.0-flash")

def analyze_sentiment(review_id: str, text: str):
    """Runs the sentiment chain and writes to Supabase."""
    try:
        chain = LLMChain(llm=llm, prompt=PROMPT)
        output = chain.run(text=text)
        logging.info(f"Raw sentiment output for {review_id}: {output}")

        if "```json" in output:
            output = output.split("```json")[1]
            output = output.split("```")[0].strip()  # Extract JSON part

        # Add try-except for JSON parsing
        try:
            data = json.loads(output)
            if not isinstance(data, dict) or "score" not in data or "summary" not in data:
                 raise ValueError("Invalid JSON structure received from LLM")
            score = int(data["score"]) # Ensure score is an integer
            summary = str(data["summary"]) # Ensure summary is a string
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            logging.error(f"Failed to parse sentiment JSON for review {review_id}: {e}. Output was: {output}")
            return

        supabase.table("sentiments").insert({
            "review_id": review_id,
            "score": score,
            "summary": summary,
        }).execute()
        logging.info(f"Stored sentiment for review {review_id}")

    except Exception as e:
        logging.error(f"Error in analyze_sentiment for review {review_id}: {e}", exc_info=True)

