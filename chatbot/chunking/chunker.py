
from langchain_text_splitters import RecursiveCharacterTextSplitter
from transformers import AutoTokenizer

MODEL_NAME = "BAAI/bge-base-en-v1.5"


def split_docs(documents):
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
        tokenizer,
        chunk_size=350,
        chunk_overlap=60,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    chunks = splitter.split_documents(documents)

    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = f"{chunk.metadata['book_id']}_{i}"

    print(f"Created {len(chunks)} chunks")
    return chunks
