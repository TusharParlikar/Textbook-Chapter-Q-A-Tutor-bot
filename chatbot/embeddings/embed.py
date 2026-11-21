from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv

def get_embedding():
    """
    return embedding
    """
    embeddings = HuggingFaceEmbeddings(model_name = "sentence-transformers/all-MiniLM-L6-v2")
    return embeddings



