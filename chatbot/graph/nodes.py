
from langchain_core.messages import AIMessage, HumanMessage

from chatbot.graph.state import TutorState
from chatbot.llm.model import get_llm
from chatbot.prompt.prompt_temp import ANSWER_PROMPT, REWRITE_PROMPT
from chatbot.retrieval.reranker import BGEReranker
from chatbot.retrieval.retriever import HybridRetriever

# Load models and indexes once per running process.
llm = get_llm()
retriever = HybridRetriever()
reranker = BGEReranker()


def message_text(message):
    return str(message.content)


def get_history(messages):
    # Exclude the latest student question.
    return "\n".join(
        f"{'Student' if isinstance(m, HumanMessage) else 'Tutor'}: "
        f"{message_text(m)}"
        for m in messages[:-1][-6:]
        if isinstance(m, (HumanMessage, AIMessage))
    )


def rewrite_question(state: TutorState):
    messages = state["messages"]
    question = message_text(messages[-1])
    history = get_history(messages)

    # A standalone first question needs no rewriting.
    if not history:
        return {"rewritten_query": question}

    prompt = REWRITE_PROMPT.format(
        history=history,
        question=question
    )

    response = llm.invoke(prompt)
    rewritten = message_text(response).strip()

    return {"rewritten_query": rewritten or question}


def retrieve_evidence(state: TutorState):
    query = state["rewritten_query"]

    candidates = retriever.search(query, top_k=20)
    ranked = reranker.rerank(query, candidates, top_k=5)

    evidence = []

    for i, (doc, score) in enumerate(ranked, 1):
        evidence.append({
            "id": i,
            "book": doc.metadata["book_title"],
            "page": doc.metadata["page_number"],
            "chunk_id": doc.metadata["chunk_id"],
            "text": doc.page_content,
            "rerank_score": score
        })

    return {"evidence": evidence}


def generate_answer(state: TutorState):
    evidence = state["evidence"]

    if not evidence:
        answer = (
            "I couldn't find relevant information "
            "in the provided textbooks."
        )
        return {
            "answer": answer,
            "messages": [AIMessage(content=answer)]
        }

    context = "\n\n".join(
        f"[{item['id']}] "
        f"{item['book']} | PDF page {item['page']}\n"
        f"{item['text']}"
        for item in evidence
    )

    prompt = ANSWER_PROMPT.format(
        history=get_history(state["messages"]),
        question=state["rewritten_query"],
        context=context
    )

    response = llm.invoke(prompt)
    answer = message_text(response)

    return {
        "answer": answer,
        "messages": [AIMessage(content=answer)]
    }
