from dotenv import load_dotenv
from pinecone import Pinecone
import os

load_dotenv()
pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENV")
)
idx = pc.Index(os.getenv("PINECONE_INDEX"))

# A) Describe index
print("INDEX STATS:", idx.describe_index_stats())

# B) Upsert + query dummy vector
dummy = [0.01] * 1024
idx.upsert(vectors=[{"id": "test-id", "values": dummy, "metadata": {"foo": "bar"}}])

result = idx.query(vector=dummy, top_k=1, include_metadata=True)
print("QUERY RESULT:", result["matches"])