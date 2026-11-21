import json
import os
import re
from pathlib import Path
import httpx
from typing import Literal
from dotenv import load_dotenv
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError
from .planner import SYSTEM_PROMPT

ROOT_DIR = Path(__file__).resolve().parents[2]

load_dotenv(ROOT_DIR / ".env")

MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "nvidia/nemotron-3-ultra-550b-a55b:free"
)

AVAILABLE_SIMULATIONS = {
    "linear_regression",
    "plotly",
    "overfitting",
    "logistic_regression",
    "kmeans",
    "knn",
    "gradient_descent",
    "neural_network"
}


class ChartTrace(BaseModel):
    name: str
    type: Literal["scatter", "bar"]
    mode: Literal["lines", "markers", "lines+markers"] = "lines"
    x: list[float]
    y: list[float]


class ChartConfig(BaseModel):
    title: str
    x_label: str
    y_label: str
    traces: list[ChartTrace]


class LearningResult(BaseModel):
    title: str
    explanation: str
    formula: str
    steps: list[str]
    simulation: str
    parameters: dict


async def generate_learning_content(query: str):

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key missing."
        )

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": query
            }
        ],
        "temperature": 0.3,
        "max_tokens": 2500
    }

    try:
        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json=payload
            )

        response.raise_for_status()

        content = response.json()["choices"][0]["message"]["content"]

        cleaned = re.sub(
            r"^```(?:json)?\s*|\s*```$",
            "",
            content.strip()
        )

        result = LearningResult.model_validate(
            json.loads(cleaned)
        )

        if result.simulation not in AVAILABLE_SIMULATIONS:
            result.simulation = "none"
            result.parameters = {}
        
        if result.simulation == "plotly":
            chart = ChartConfig.model_validate(result.parameters)

            if not 1 <= len(chart.traces) <= 8:
                raise ValueError("Invalid number of traces")

            for trace in chart.traces:
                if not 1 <= len(trace.x) == len(trace.y) <= 100:
                    raise ValueError("Invalid chart data")

            result.parameters = chart.model_dump()


        return result.model_dump()

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"OpenRouter error: {exc.response.status_code}"
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to OpenRouter."
        )

    except (ValidationError, ValueError, KeyError,
            IndexError, TypeError, AttributeError):
        raise HTTPException(
            status_code=502,
            detail="Invalid AI response. Please retry."
        )