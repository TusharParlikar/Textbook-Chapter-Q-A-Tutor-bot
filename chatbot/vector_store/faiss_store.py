from langchain_community.vectorstores import FAISS

def create_embeddings(chunks,embeddings):
    vector_store = FAISS.from_documents(
        documents = chunks,
        embedding = embeddings
    )
    return vector_store
