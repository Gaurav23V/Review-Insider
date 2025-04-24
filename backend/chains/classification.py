from clients.supabase_client import supabase
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from clients.gemini_llm import GeminiLLM

PROMPT = PromptTemplate(
    template=(
        "Classify this review into one of these buckets: "
        "{buckets}. Review: \"{text}\". Output only the bucket name."
    ),
    input_variables=["text", "buckets"],
)

llm = GeminiLLM(model="gemini-2.0-flash")

def classify_review(review_id: str, text: str, buckets: str = "Service,Location,Product"):
    """Classifies and writes to Supabase."""
    chain = LLMChain(llm=llm, prompt=PROMPT)
    label = chain.run(text=text, buckets=buckets).strip()

    supabase.table("classifications").insert({
        "review_id": review_id,
        "label": label,
    }).execute()
