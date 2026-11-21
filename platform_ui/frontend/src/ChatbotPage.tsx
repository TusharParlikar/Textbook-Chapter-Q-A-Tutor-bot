
import { useRef, useState } from "react";

type Source = {
  id: number;
  book: string;
  page: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const threadId = useRef(crypto.randomUUID());

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setLoading(true);

    setMessages(prev => [
      ...prev,
      { role: "user", content: question },
    ]);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          thread_id: threadId.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API returned ${response.status}`);
      }

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Unable to get an answer: ${String(error)}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    if (loading) return;
    threadId.current = crypto.randomUUID();
    setMessages([]);
    setInput("");
  }

  return (
    <section className="tutor-page">
      <header className="tutor-heading">
        <div>
          <h1>AI Textbook Tutor</h1>
          <p>Learn from AI textbooks using LangGraph + RAG.</p>
        </div>

        <button onClick={newChat}>+ New Chat</button>
      </header>

      <div className="tutor-chat">
        <div className="tutor-messages">
          {messages.length === 0 && (
            <div className="tutor-welcome">
              <h2>What would you like to learn?</h2>
              <p>Ask me anything about Artificial Intelligence.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <article
              key={index}
              className={`tutor-message ${message.role}`}
            >
              <strong>
                {message.role === "user" ? "You" : "AI Tutor"}
              </strong>

              <div className="tutor-answer">
                {message.content}
              </div>

              {!!message.sources?.length && (
                <div className="tutor-sources">
                  <strong>Textbook Sources</strong>

                  {message.sources.map(source => (
                    <p key={`${source.id}-${source.page}`}>
                      [{source.id}] {source.book}
                      {" — PDF Page "}
                      {source.page}
                    </p>
                  ))}
                </div>
              )}
            </article>
          ))}

          {loading && <p>AI Tutor is thinking...</p>}
        </div>

        <div className="tutor-input">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask about RAG, transformers, machine learning..."
            rows={2}
          />

          <button
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
