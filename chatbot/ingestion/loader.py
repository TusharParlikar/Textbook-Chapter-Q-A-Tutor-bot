from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

BOOKS = {
    "ai_foundations": "ArtInt3e.pdf",
    "ai_engineering": "AI Engineering- Building Applications with Foundation Models -- Chip Huyen -- ( WeLib.org ).pdf",
}


def load_books():
    documents = []

    for book_id, filename in BOOKS.items():
        path = DATA_DIR / filename

        if not path.exists():
            print(f"Skipping missing PDF: {path}")
            continue

        pages = PyPDFLoader(str(path)).load()

        for page in pages:
            page.metadata.update({
                "book_id": book_id,
                "book_title": path.stem,
                "page_number": page.metadata["page"] + 1
            })

        documents.extend(pages)
        print(f"Loaded {len(pages)} pages from {filename}")

    if not documents:
        raise FileNotFoundError(
            f"No textbook PDFs found in {DATA_DIR}. Expected: {', '.join(BOOKS.values())}"
        )

    return documents
