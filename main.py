import os
from pathlib import Path

from dotenv import load_dotenv

from ingestion.loadder import pdf_load
from chunking.chunker import split_docs
from embeddings.embed import get_embedding
from vector_store.faiss_store import create_embeddings
from retrieval.retriever import get_retriever
from prompt.prompt_temp import get_prompt
from llm.model import get_llm

load_dotenv()


def main():

    print("Loading PDF...")

    # Step 1: Load PDF
    pdf_path = Path(__file__).parent / os.environ["PDF_PATH"]

    documents = pdf_load(str(pdf_path))

    print(f"Loaded {len(documents)} pages.")

    # Step 2: Split into chunks
    chunks = split_docs(documents)

    print(f"Created {len(chunks)} chunks.")

    # Step 3: Load embedding model
    embedding_model = get_embedding()

    # Step 4: Create FAISS vector store
    vector_store = create_embeddings(
        chunks,
        embedding_model
    )

    # Step 5: Create retriever
    retriever = get_retriever(vector_store)

    # Step 6: Load prompt
    prompt = get_prompt()

    # Step 7: Load Gemini LLM
    llm = get_llm()

    print("\nPDF RAG Chatbot is Ready!")
    print("Type 'exit' to quit.\n")

    while True:

        question = input("Question: ").strip()

        if question.lower() == "exit":
            print("Exiting PDF RAG Chatbot...")
            break

        if not question:
            continue

        try:
            # Step 8: Retrieve relevant chunks
            retrieved_docs = retriever.invoke(question)

            # Step 9: Build context
            context = "\n\n".join(
                doc.page_content for doc in retrieved_docs
            )

            # Step 10: Create final prompt
            final_prompt = prompt.invoke({
                "context": context,
                "question": question
            })

            # Step 11: Generate answer using Gemini
            response = llm.invoke(final_prompt)

            # Step 12: Print clean response text
            print("\nAnswer:\n")

            content = response.content

            if isinstance(content, list):
                answer = "\n".join(
                    item["text"]
                    for item in content
                    if isinstance(item, dict)
                    and item.get("type") == "text"
                    and isinstance(item.get("text"), str)
                )
                print(answer if answer else "No text answer returned.")
            else:
                print(content)

            print("-" * 60)

        except Exception as e:
            print(f"\nError while generating answer: {e}")
            print("Please try asking your question again.")
            print("-" * 60)


if __name__ == "__main__":
    main()
