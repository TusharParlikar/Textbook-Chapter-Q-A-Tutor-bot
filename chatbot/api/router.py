
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


@asynccontextmanager
async def lifespan(app: FastAPI):
    from chatbot.graph.workflow import build_graph

    app.state.graph = build_graph()
    yield


app = FastAPI(
    title="AI Textbook Tutor API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    thread_id: str = Field(min_length=1)


@app.get("/health")
def health():
    return {"status": "ok", "service": "chatbot"}


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        result = app.state.graph.invoke(
            {"messages": [("user", request.message)]},
            config={
                "configurable": {
                    "thread_id": request.thread_id
                }
            },
        )

        return {
            "answer": result["answer"],
            "rewritten_query": result["rewritten_query"],
            "sources": [
                {
                    "id": item["id"],
                    "book": item["book"],
                    "page": item["page"],
                }
                for item in result["evidence"]
            ],
        }

    except Exception as exc:
        print(f"Chatbot error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Chatbot request failed. Check server logs.",
        ) from exc
