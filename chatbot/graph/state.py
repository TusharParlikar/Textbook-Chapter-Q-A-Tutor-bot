from langgraph.graph import MessagesState


class TutorState(MessagesState):
    rewritten_query: str
    evidence: list[dict]
    answer: str