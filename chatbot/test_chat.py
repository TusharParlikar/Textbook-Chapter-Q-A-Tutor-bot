
from chatbot.graph.workflow import build_graph


def main():
    app = build_graph()

    config = {
        "configurable": {
            "thread_id": "student_001"
        }
    }

    print("\n=== AI Textbook Tutor ===")
    print("Type 'exit' to quit.\n")

    while True:
        try:
            question = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nChat ended.")
            break

        if question.lower() in ("exit", "quit"):
            break

        if not question:
            continue

        try:
            result = app.invoke(
                {"messages": [("user", question)]},
                config=config,
            )

            print("\nTutor:", result["answer"])
            print("\nSearch query:", result["rewritten_query"])

            print("\nSources:")
            for source in result["evidence"]:
                print(
                    f"[{source['id']}] "
                    f"{source['book']} - "
                    f"PDF page {source['page']}"
                )

        except Exception as error:  # noqa: BLE001
            print(f"\nError: {error}")

if __name__ == "__main__":
    main()
