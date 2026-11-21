
from pathlib import Path

from langchain_community.vectorstores import FAISS

INDEX_DIR = Path(__file__).resolve().parents[1] / "storage" / "faiss_index"


def create_index(chunks, embeddings):
    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )

    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    vector_store.save_local(str(INDEX_DIR))

    print(f"FAISS index saved to: {INDEX_DIR}")
    return vector_store
