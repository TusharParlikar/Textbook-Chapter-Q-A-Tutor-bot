
import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_openrouter import ChatOpenRouter

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")


def get_llm():
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL")

    if not api_key:
        raise ValueError("OPENROUTER_API_KEY missing in .env")

    if not model:
        raise ValueError("OPENROUTER_MODEL missing in .env")

    return ChatOpenRouter(
        model=model,
        api_key=api_key,
        temperature=0
    )
