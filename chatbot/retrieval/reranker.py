
from sentence_transformers import CrossEncoder


class BGEReranker:
    def __init__(self):
        self.model = CrossEncoder(
            "BAAI/bge-reranker-base",
            device="cpu",
            max_length=512
        )

    def rerank(self, query, documents, top_k=5):
        if not documents:
            return []

        pairs = [
            (query, doc.page_content)
            for doc in documents
        ]

        scores = self.model.predict(
            pairs,
            batch_size=8,
            show_progress_bar=False
        )

        ranked = sorted(
            zip(documents, scores),
            key=lambda item: float(item[1]),
            reverse=True
        )

        return [
            (doc, float(score))
            for doc, score in ranked[:top_k]
        ]
