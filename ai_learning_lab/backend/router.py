
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .service import generate_learning_content

app = FastAPI(title="AI Learning Lab")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

class LearningQuery(BaseModel):
    query: str = Field(min_length=2, max_length=300)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/learning-lab")
async def learning_lab(data: LearningQuery):
    return await generate_learning_content(data.query)
