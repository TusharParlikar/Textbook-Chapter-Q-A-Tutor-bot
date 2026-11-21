
from langchain_huggingface import HuggingFaceEmbeddings


def get_embedding():
    return HuggingFaceEmbeddings(
        model_name="BAAI/bge-base-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={
            "normalize_embeddings": True,
            "batch_size": 16
        }
    )
