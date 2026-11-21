
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph

from chatbot.graph.nodes import generate_answer, retrieve_evidence, rewrite_question
from chatbot.graph.state import TutorState


def build_graph():
    builder = StateGraph(TutorState)

    builder.add_node("rewrite", rewrite_question)
    builder.add_node("retrieve", retrieve_evidence)
    builder.add_node("generate", generate_answer)

    builder.add_edge(START, "rewrite")
    builder.add_edge("rewrite", "retrieve")
    builder.add_edge("retrieve", "generate")
    builder.add_edge("generate", END)

    return builder.compile(
        checkpointer=InMemorySaver()
    )
