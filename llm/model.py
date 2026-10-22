import os

from dotenv import load_dotenv

load_dotenv()


def get_llm():
    # Groq when a key is set (Streamlit Cloud), otherwise local Ollama
    if os.getenv("GROQ_API_KEY"):
        from langchain_groq import ChatGroq

        return ChatGroq(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            temperature=0.2,
        )

    from langchain_ollama import ChatOllama

    # Pull the model first: `ollama pull <OLLAMA_MODEL>`
    return ChatOllama(
        model=os.getenv("OLLAMA_MODEL", "qwen3:1.7b"),
        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        temperature=0.2,
        reasoning=False,
    )
