import os
from dotenv import load_dotenv
from google import genai
from langchain.llms.base import LLM
from typing import Optional, List, Any, Dict
from pydantic import Field

load_dotenv()

class GeminiLLM(LLM):
    """A LangChain-compatible wrapper around google-genai Client.generate_content."""
    
    model: str = Field(default="gemini-2.0-flash")
    client: Any = Field(default=None)
    
    def __init__(self, model: str = "gemini-2.0-flash", **kwargs):
        super().__init__(model=model, **kwargs)
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    @property
    def _llm_type(self) -> str:
        return "gemini"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        resp = self.client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        return resp.text