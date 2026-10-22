# Textbook Tutor Bot: How It Works and How to Run It

## What this project is

A chatbot that answers questions about **one PDF book**. You type a question in the terminal, and the bot:

1. finds the 3 passages of the book most related to your question, and
2. gives those passages to a local LLM (via Ollama) with the instruction "answer only from this text".

This technique is called **RAG (Retrieval-Augmented Generation)**. The LLM doesn't have to "know" the book; it reads the relevant pages each time you ask. If the answer isn't in those pages, it is told to say *"I don't know based on the provided context."*

## The big picture

```
                 AT STARTUP (runs each time you start app.py / main.py)
 PDF ──► load pages ──► split into chunks ──► turn chunks into vectors ──► FAISS index
         (PyPDFLoader)   (RecursiveCharacter-    (HuggingFaceEmbeddings     (FAISS.from_documents)
                          TextSplitter)           all-MiniLM-L6-v2)

                 FOR EVERY QUESTION
 question ──► vector ──► FAISS finds 3 closest chunks ──► prompt (chunks + question) ──► Ollama LLM ──► answer
              (same       (retriever.invoke, k=3)          (PromptTemplate)               (ChatOllama      (st.write_stream /
               embedding                                                                   qwen3:1.7b)      print)
               model)
```

## Each file, in the order it runs

| Step | File | What it does |
|------|------|--------------|
| 1 | [ingestion/loadder.py](ingestion/loadder.py) | `PyPDFLoader` reads the PDF and returns one `Document` per page (text + page number). |
| 2 | [chunking/chunker.py](chunking/chunker.py) | Splits pages into chunks of ~1000 characters with a 200-character overlap, so a sentence cut at a boundary still appears whole in one chunk. |
| 3 | [embeddings/embed.py](embeddings/embed.py) | Loads `all-MiniLM-L6-v2`, a small Hugging Face model that turns text into a list of 384 numbers (a *vector*). Texts with similar meaning get similar vectors. |
| 4 | [vector_store/faiss_store.py](vector_store/faiss_store.py) | Embeds every chunk and stores the vectors in a **FAISS** index, a fast "find the nearest vectors" database kept in memory. |
| 5 | [retrieval/retriever.py](retrieval/retriever.py) | Wraps FAISS as a retriever that returns the `k=3` most similar chunks for a question. |
| 6 | [prompt/prompt_temp.py](prompt/prompt_temp.py) | The prompt template: rules ("use ONLY the context…") + `{context}` + `{question}`. |
| 7 | [llm/model.py](llm/model.py) | Creates the LLM: `qwen3:1.7b` running locally through Ollama. |
| — | [main.py](main.py) | Wires steps 1–7 together, then loops: read question → retrieve → build prompt → ask LLM → print answer. Type `exit` to quit. |

## Tools and libraries used

Each step of the pipeline, the library behind it, and the exact class/function called:

```
PDF        ──►  load pages     PyPDFLoader(path).load()                    langchain-community + pypdf
pages      ──►  chunks         RecursiveCharacterTextSplitter               langchain-text-splitters
                                 .split_documents(docs)
chunks     ──►  vectors        HuggingFaceEmbeddings("all-MiniLM-L6-v2")    langchain-huggingface + sentence-transformers + torch
vectors    ──►  index          FAISS.from_documents(chunks, embeddings)    langchain-community + faiss-cpu
question   ──►  top 3 chunks   vector_store.as_retriever(k=3).invoke(q)     langchain (FAISS)
chunks + q ──►  prompt         PromptTemplate(...).invoke({...})            langchain-core
prompt     ──►  answer         ChatOllama("qwen3:1.7b").invoke / .stream    langchain-ollama + Ollama
answer     ──►  screen         st.chat_input, st.write_stream, st.expander  streamlit (app.py)  /  print (main.py)
```

| Library | Used for | Where |
|---------|----------|-------|
| `pypdf` | Reads the text out of each PDF page (used inside `PyPDFLoader`) | [ingestion/loadder.py](ingestion/loadder.py) |
| `langchain-community` | `PyPDFLoader` (PDF → Documents) and `FAISS` (vector store wrapper) | [ingestion/loadder.py](ingestion/loadder.py), [vector_store/faiss_store.py](vector_store/faiss_store.py) |
| `langchain-text-splitters` | `RecursiveCharacterTextSplitter`: splits on paragraphs → sentences → words to hit ~1000 chars | [chunking/chunker.py](chunking/chunker.py) |
| `langchain-huggingface` | `HuggingFaceEmbeddings`: LangChain wrapper around the embedding model | [embeddings/embed.py](embeddings/embed.py) |
| `sentence-transformers`, `transformers`, `torch` | Actually run `all-MiniLM-L6-v2` to produce the 384-number vectors | (used by the line above) |
| `faiss-cpu` | Facebook's similarity-search library: finds the nearest vectors fast | [vector_store/faiss_store.py](vector_store/faiss_store.py) |
| `langchain-core` | `PromptTemplate`: fills `{context}` and `{question}` into the prompt | [prompt/prompt_temp.py](prompt/prompt_temp.py) |
| `langchain-ollama` | `ChatOllama`: sends the prompt to the local Ollama server and returns/streams the answer | [llm/model.py](llm/model.py) |
| **Ollama** (app, not a pip package) | Runs the `qwen3:1.7b` LLM on your machine | installed separately |
| `streamlit` | Web chat UI; `@st.cache_resource` keeps the index in memory between questions | [app.py](app.py) |

## Setup (Windows, PowerShell)

### 1. Install Ollama and the model

Install Ollama from https://ollama.com, then:

```powershell
ollama pull qwen3:1.7b
```

Ollama must be running in the background (it starts automatically after install).

### 2. Create the virtual environment and install packages

From the project folder:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt pypdf
```

The first install is large (PyTorch is several hundred MB).

### 3. Put your PDF in `data/`

Then set the file name in [main.py](main.py) (the `pdf_path` near the top) to match it.

### 4. Run

Web UI (recommended): open http://localhost:8501 after running:

```powershell
.\.venv\Scripts\Activate.ps1
streamlit run app.py
```

Terminal version:

```powershell
.\.venv\Scripts\Activate.ps1
python main.py
```

Wait for `PDF RAG Chatbot is Ready!`, then ask questions.

## Things to know

- **Startup is slow for big books.** The whole PDF is re-embedded every time you start `main.py`; nothing is saved to disk. A 500-page book can take a few minutes on CPU. (The fix would be `vector_store.save_local(...)` once and `FAISS.load_local(...)` afterwards.)
- **The first run downloads the embedding model** (~90 MB) from Hugging Face. Later runs use the cached copy.
- **Answer quality depends on retrieval.** If the 3 retrieved chunks don't contain the answer, the bot says it doesn't know, even if the book covers it elsewhere. Raising `k` in [retrieval/retriever.py](retrieval/retriever.py) gives the LLM more context, but it gets slower.
- **`qwen3:1.7b` is small.** It's fast but sometimes vague. For better answers, pull a bigger model (e.g. `ollama pull qwen3:8b`) and change the name in [llm/model.py](llm/model.py).
- **Scanned PDFs (images only) won't work**: there is no text to extract without OCR.

## Common changes

| I want to… | Change |
|-----------|--------|
| Use a different book | Drop the PDF in `data/`, update `pdf_path` in [main.py](main.py) |
| Use a different LLM | `model=` in [llm/model.py](llm/model.py) (must be pulled in Ollama first) |
| Get longer/shorter chunks | `chunk_size` / `chunk_overlap` in [chunking/chunker.py](chunking/chunker.py) |
| Retrieve more passages | `k` in [retrieval/retriever.py](retrieval/retriever.py) |
| Change the bot's tone or rules | The template text in [prompt/prompt_temp.py](prompt/prompt_temp.py) |
