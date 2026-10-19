# Textbook-Chapter-QA-Tutor-bot

A Retrieval-Augmented Generation (RAG) chatbot that lets you ask questions about a PDF document and receive context-aware answers powered by Google Gemini.

Instead of relying entirely on an LLM's internal knowledge, the chatbot retrieves relevant text chunks from the PDF using semantic similarity search with FAISS and passes them to Gemini as context.

Built with **Python, LangChain, Hugging Face, Sentence Transformers, FAISS, and Google Gemini**.

## Features

- **PDF ingestion:** Extract text and page metadata using LangChain's `PyPDFLoader`.
- **Text chunking:** Split documents into overlapping chunks for efficient retrieval.
- **Semantic embeddings:** Convert text into vectors using `all-MiniLM-L6-v2`.
- **Vector search:** Retrieve the most relevant chunks using FAISS.
- **LLM-powered answers:** Generate responses using Google's Gemini API.
- **Context-grounded prompting:** Instruct the LLM to answer using the retrieved document context.
- **Interactive CLI:** Ask multiple questions about the PDF in one session.
- **Modular architecture:** Separate components for ingestion, chunking, embeddings, retrieval, vector storage, prompting, and generation.

## Architecture

```text
                 PDF Document
                      |
                      v
                PDF Loader
                      |
                      v
               Extracted Text
                      |
                      v
                Text Splitter
                      |
                      v
                Text Chunks
                      |
                      v
             Embedding Model
          all-MiniLM-L6-v2
                      |
                      v
                FAISS Index
                      |
                      |
User Question --------+
      |
      v
   Retriever
      |
      v
Relevant PDF Chunks
      |
      v
 Prompt Template
      |
      v
 Google Gemini
      |
      v
  Final Answer
```

## Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| LangChain | Document loading and RAG orchestration |
| PyPDF | PDF text extraction |
| Hugging Face | Embedding model integration |
| Sentence Transformers | Text embedding generation |
| `all-MiniLM-L6-v2` | Semantic embeddings |
| FAISS | Vector indexing and similarity search |
| Google Gemini API | Answer generation |
| `langchain-google-genai` | Gemini integration with LangChain |
| `python-dotenv` | Environment variable management |

## Project Structure

```text
YouTube_RAG_ChatBot/
│
├── chunking/
│   └── chunker.py
│
├── data/
│   └── your_document.pdf
│
├── embeddings/
│   └── embed.py
│
├── ingestion/
│   └── loadder.py
│
├── llm/
│   └── model.py
│
├── prompt/
│   └── prompt_temp.py
│
├── retrieval/
│   └── retriever.py
│
├── vector_store/
│   └── faiss_store.py
│
├── .env
├── .gitignore
├── main.py
└── requirements.txt
```

> Note: The local directory and `loadder.py` filename retain their existing names. They can be renamed separately if desired.

## How It Works

### 1. PDF Ingestion

The PDF loader extracts the document's text and page metadata.

```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader(pdf_path)
documents = loader.load()
```

Each page is represented as a LangChain `Document`.

### 2. Text Chunking

The extracted text is split using `RecursiveCharacterTextSplitter`.

Current configuration:

- Chunk size: 1,000 characters
- Chunk overlap: 200 characters

Overlapping chunks help preserve context across chunk boundaries.

### 3. Embedding Generation

The `all-MiniLM-L6-v2` embedding model converts each chunk into a numerical vector representing its semantic meaning.

### 4. FAISS Vector Store

FAISS indexes the document embeddings so that relevant chunks can be retrieved efficiently.

The current implementation creates the FAISS index in memory each time the application starts.

### 5. Retrieval

When a user submits a question, the retriever performs similarity search and returns the top three relevant chunks.

### 6. Prompt Construction

The retrieved chunks are combined into a context string and passed to the existing prompt template along with the user's question.

The prompt instructs Gemini to answer using the supplied context and to acknowledge when the answer is not present.

### 7. Answer Generation

Google Gemini receives the constructed prompt and generates the final response. The chatbot prints the text answer in the terminal.

## Installation and Setup

### Prerequisites

- Python 3.10 or a compatible Python version for the installed dependencies
- Git
- A Google Gemini API key
- An internet connection for model downloads and Gemini API requests

### 1. Clone the Repository

```bash
git clone https://github.com/alobroke/YouTube_RAG_ChatBot.git

cd YouTube_RAG_ChatBot
```

### 2. Create a Virtual Environment

**Windows PowerShell**

```powershell
python -m venv .venv

.\.venv\Scripts\Activate.ps1
```

**Linux / macOS**

```bash
python -m venv .venv

source .venv/bin/activate
```

### 3. Install Dependencies

Install the existing project requirements:

```bash
pip install -r requirements.txt
```

Install the additional PDF and Gemini integrations:

```bash
pip install pypdf langchain-google-genai
```

## Configure the Gemini API

### 1. Get an API Key

Create an API key through [Google AI Studio](https://aistudio.google.com/apikey).

Gemini API access and billing are separate from a Google AI Pro app subscription; check the applicable API limits and pricing for your account.

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key
```

The LLM module loads this key through `python-dotenv`.

**Security:** Never commit `.env` to GitHub. Ensure it is listed in `.gitignore`, and never share your API key publicly.

## Add a PDF Document

Place your PDF inside the `data/` directory.

```text
data/
└── your_document.pdf
```

Update the PDF filename in `main.py` to match the document you want to process.

The current implementation loads a configured PDF file rather than accepting an arbitrary file upload through a web interface.

Text-based PDFs are supported. Scanned PDFs that contain only images may require OCR.

## Run the Chatbot

From the project root, execute:

```bash
python main.py
```

The application will:

1. Load the configured PDF.
2. Split its text into chunks.
3. Initialize the embedding model.
4. Create a FAISS vector index.
5. Initialize the retriever, prompt, and Gemini model.
6. Start the interactive question-answering loop.

## Example Interaction

```text
Loading PDF...
Loaded 250 pages.
Created 850 chunks.

PDF RAG Chatbot is Ready!
Type 'exit' to quit.

Question: What is Retrieval-Augmented Generation?

Answer:

Retrieval-Augmented Generation (RAG) combines information
retrieval with text generation. Relevant information is
retrieved from a knowledge source and supplied to a
language model as context for generating a response.

------------------------------------------------------------
Question: exit
Exiting PDF RAG Chatbot...
```

*The page count, chunk count, and answer above are illustrative. Actual values depend on your PDF and model response.*

## Current Limitations

- Processes one configured PDF per run.
- Rebuilds the FAISS index whenever the application starts.
- Retrieves a fixed number of relevant chunks.
- Does not yet display source-page citations with answers.
- Scanned PDFs may need a separate OCR step.
- Answer quality depends on PDF extraction, retrieval relevance, and the Gemini model.

## Future Improvements

- Support multiple PDFs in one knowledge base.
- Persist the FAISS index to avoid re-embedding documents on every run.
- Display page numbers and source references in answers.
- Add a Streamlit or FastAPI interface.
- Support scanned documents with OCR.
- Add document-level filtering and retrieval evaluation.

These are potential extensions and are not part of the current implementation.


