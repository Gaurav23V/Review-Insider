import os
from google import genai
from dotenv import load_dotenv
from clients.pinecone_client import upsert_review_embedding
from clients.supabase_client import supabase
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)

# Using text-embedding-004 (768 dimensions)
EMBED_MODEL = "models/text-embedding-004"
EXPECTED_DIMENSION = 768 # CRITICAL: Pinecone index & Supabase column MUST match this

def embed_and_store(review_id: str, text: str, metadata: dict):
    """
    1) Call Gemini to get embeddings using client.models.embed_content
    2) Upsert into Pinecone
    3) Insert embedding metadata into Supabase
    """
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        logging.info(f"Requesting embedding for review {review_id} using model {EMBED_MODEL}")

        # Correct method access: client.models.embed_content
        embed_resp = client.models.embed_content(
            model=EMBED_MODEL,
            contents=text,
        )

        # Check if the response has the 'embeddings' list and it's not empty
        if not hasattr(embed_resp, 'embeddings') or not embed_resp.embeddings:
             logging.error(f"Embedding failed or unexpected response structure (no embeddings list) for review {review_id}. Response: {embed_resp}")
             return

        # Access the first embedding object in the list
        embedding_object = embed_resp.embeddings[0]

        # Check if the embedding object has the 'values' attribute and it's a list
        if not hasattr(embedding_object, 'values') or not isinstance(embedding_object.values, list):
            logging.error(f"Embedding object missing 'values' list for review {review_id}. Embedding object: {embedding_object}")
            return

        vector = embedding_object.values 

        # Check dimension
        if len(vector) != EXPECTED_DIMENSION:
             logging.error(f"Unexpected embedding dimension for review {review_id}. Expected {EXPECTED_DIMENSION}, got {len(vector)}. Check Pinecone/Supabase column dimensions!")
             # Stop here if dimensions mismatch, otherwise subsequent steps will fail.
             return

        logging.info(f"Generated embedding for review {review_id}, dimension: {len(vector)}")

        # 2) upsert to Pinecone (ensure Pinecone index matches EXPECTED_DIMENSION)
        upsert_review_embedding(review_id, vector, metadata)
        logging.info(f"Upserted embedding to Pinecone for review {review_id}")

        # 3) store in Supabase embeddings table (ensure 'vector' column matches EXPECTED_DIMENSION)
        response = supabase.table("embeddings").insert({
            "review_id": review_id,
            "vector": vector,
            "service": metadata.get("service"),
            "location": metadata.get("location"),
            "product": metadata.get("product"),
        }).execute()
        logging.info(f"Stored embedding metadata in Supabase for review {review_id}")

    except Exception as e:
        logging.error(f"Error in embed_and_store for review {review_id}: {e}", exc_info=True)

