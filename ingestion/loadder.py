from langchain_community.document_loaders import PyPDFLoader


def pdf_load(pdf_path):
    """
    Load PDF and return a list of LangChain Documents.
    """
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()

    return docs
