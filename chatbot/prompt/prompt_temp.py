from langchain_core.prompts import PromptTemplate


def get_prompt():
    """
    Returns the RAG prompt template.
    """

    prompt = PromptTemplate(
        template="""
You are a helpful AI assistant.

Use ONLY the provided context to answer the user's question.

Rules:
1. Do not use outside knowledge.
2. If the answer is not present in the context, reply:
   "I don't know based on the provided context."
3. Be clear and concise.
4. If appropriate, answer using bullet points.

Context:
{context}

Question:
{question}

Answer:
""",
        input_variables=["context", "question"],
    )

    return prompt