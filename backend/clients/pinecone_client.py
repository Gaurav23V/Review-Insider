import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()  

# 1) Instantiate the Pinecone client
pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENV"),
)

# 2) Bind to your index
INDEX_NAME = os.getenv("PINECONE_INDEX")
index = pc.Index(INDEX_NAME)

def upsert_review_embedding(review_id: str, vector: list[float], metadata: dict):
    """
    Upsert one record. Uses the v6 HTTP API.
    """
    index.upsert(
        vectors=[{"id": review_id, "values": vector, "metadata": metadata}]
    )

def query_similar(vector: list[float], top_k: int = 5):
    """
    Query top_k nearest neighbors.
    """
    resp = index.query(
        top_k=top_k,
        queries=[{"values": vector}],
        include_metadata=False,
    )
    return resp["matches"]
