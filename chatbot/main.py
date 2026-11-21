
from chatbot.chunking.chunker import split_docs
from chatbot.embeddings.embed import get_embedding
from chatbot.ingestion.loader import load_books
from chatbot.vector_store.faiss_store import create_index


def main():
    print("\n=== AI Textbook Indexing ===\n")

    documents = load_books()
    chunks = split_docs(documents)

    print("\nLoading BGE embedding model...")
    embeddings = get_embedding()

    print("Creating FAISS index...")
    index = create_index(chunks, embeddings)

    print("\nIndexing completed!")
    print(f"Total pages: {len(documents)}")
    print(f"Total chunks: {len(chunks)}")
    print(f"Indexed vectors: {index.index.ntotal}")


if __name__ == "__main__":
    main()
