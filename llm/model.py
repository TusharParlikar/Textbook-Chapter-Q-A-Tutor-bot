import os

from dotenv import load_dotenv

load_dotenv()


def get_llm():
    # Hosted OpenAI-compatible API (e.g. Groq) when a key is set, otherwise local Ollama
    if os.getenv("LLM_API_KEY"):
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            base_url=os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1"),
            api_key=os.environ["LLM_API_KEY"],
            model=os.getenv("LLM_MODEL", "openai/gpt-oss-120b"),
            timeout=float(os.getenv("LLM_TIMEOUT", "120")),
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
