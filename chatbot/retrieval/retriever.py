
import re

from langchain_community.vectorstores import FAISS
from rank_bm25 import BM25Okapi

from chatbot.embeddings.embed import get_embedding
from chatbot.vector_store.faiss_store import INDEX_DIR


def tokenize(text):
    return re.findall(r"\w+", text.lower())


class HybridRetriever:
    def __init__(self):
        embeddings = get_embedding()

        # Load only the FAISS index created by our project.
        self.store = FAISS.load_local(
            str(INDEX_DIR),
            embeddings,
            allow_dangerous_deserialization=True
        )

        # Reuse indexed documents for BM25.
        self.documents = []
        for i in range(self.store.index.ntotal):
            doc_id = self.store.index_to_docstore_id[i]
            self.documents.append(
                self.store.docstore.search(doc_id)
            )

        tokenized = [
            tokenize(doc.page_content)
            for doc in self.documents
        ]

        self.bm25 = BM25Okapi(tokenized)

    def search(self, query, top_k=10):
        # 1. Dense semantic retrieval
        dense_docs = self.store.similarity_search(
            query, k=20
        )

        # 2. BM25 keyword retrieval
        scores = self.bm25.get_scores(tokenize(query))

        top_indices = sorted(
            range(len(scores)),
            key=lambda i: scores[i],
            reverse=True
        )[:20]

        keyword_docs = [
            self.documents[i] for i in top_indices
        ]

        # 3. Reciprocal Rank Fusion
        fused = {}

        for results in [dense_docs, keyword_docs]:
            for rank, doc in enumerate(results, start=1):
                chunk_id = doc.metadata["chunk_id"]

                if chunk_id not in fused:
                    fused[chunk_id] = {
                        "doc": doc,
                        "score": 0.0
                    }

                fused[chunk_id]["score"] += 1 / (60 + rank)

        ranked = sorted(
            fused.values(),
            key=lambda item: item["score"],
            reverse=True
        )

        return [
            item["doc"]
            for item in ranked[:top_k]
        ]
