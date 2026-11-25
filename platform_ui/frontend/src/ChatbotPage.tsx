import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Handoff } from "./App";
import { IconArrowUp, IconBook, IconPlus } from "./icons";

type Source = {
  id: number;
  book: string;
  page: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  searched?: string;
  failed?: boolean;
};

const SUGGESTIONS = [
  { title: "Explain simply", text: "Explain gradient descent like I'm new to calculus." },
  { title: "Compare", text: "What is the difference between bagging and boosting?" },
  { title: "Define", text: "What is a vector embedding and why does RAG need one?" },
  { title: "Go deeper", text: "Why do transformers use positional encoding?" },
];

export default function ChatbotPage({ draft }: { draft?: Handoff | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const threadId = useRef(crypto.randomUUID());
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!draft) return;
    setInput(draft.text);
    box.current?.focus();
  }, [draft]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  async function sendMessage(text = input) {
    const question = text.trim();
    if (!question || loading) return;

    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: question }]);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, thread_id: threadId.current }),
      });

      if (!response.ok) {
        throw new Error(`The tutor service answered with ${response.status}.`);
      }

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
          searched: data.rewritten_query,
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          failed: true,
          content:
            error instanceof TypeError
              ? "Couldn't reach the tutor service. Make sure the chatbot API is running on port 8001."
              : String(error instanceof Error ? error.message : error),
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
    box.current?.focus();
  }

  const empty = messages.length === 0;

  return (
    <section className="tutor">
      <header className="page-head">
        <div>
          <p className="kicker tone-text-pine">01 · Study</p>
          <h1>Textbook Tutor</h1>
          <p className="page-sub">Answers come only from your textbooks, with the pages cited.</p>
        </div>
        <button className="btn btn-ghost" onClick={newChat} disabled={loading || empty}>
          <IconPlus size={16} /> New chat
        </button>
      </header>

      <div className="tutor-frame card">
        <div className="tutor-scroll" ref={scroller}>
          {empty ? (
            <div className="tutor-empty">
              <div className="tutor-empty-mark">
                <IconBook size={26} />
              </div>
              <h2>What are we reading today?</h2>
              <p>Ask about anything in your textbooks. Follow-up questions keep the context of the conversation.</p>

              <div className="suggest-grid">
                {SUGGESTIONS.map(s => (
                  <button key={s.text} className="suggest" onClick={() => void sendMessage(s.text)}>
                    <span className="kicker">{s.title}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="thread">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="msg-user">
                    <p>{m.content}</p>
                  </div>
                ) : (
                  <article key={i} className={`msg-note${m.failed ? " is-failed" : ""}`}>
                    <div className="note-label kicker">{m.failed ? "Couldn't answer" : "Tutor"}</div>
                    <div className="note-body">{m.content}</div>

                    {m.searched && m.searched !== messages[i - 1]?.content && (
                      <p className="note-searched">
                        Searched the books for <q>{m.searched}</q>
                      </p>
                    )}

                    {!!m.sources?.length && (
                      <div className="note-sources">
                        {m.sources.map(s => (
                          <span key={`${s.id}-${s.page}`} className="cite" title={s.book}>
                            <span className="cite-n">{s.id}</span>
                            <span className="cite-book">{s.book}</span>
                            <span className="cite-page">p. {s.page}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ),
              )}

              {loading && (
                <div className="msg-note is-thinking" aria-live="polite">
                  <div className="note-label kicker">Tutor</div>
                  <div className="thinking">
                    <span />
                    <span />
                    <span />
                    Reading the relevant pages…
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form
          className="composer"
          onSubmit={e => {
            e.preventDefault();
            void sendMessage();
          }}
        >
          <textarea
            ref={box}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask about RAG, transformers, regularisation…"
            rows={1}
            aria-label="Your question"
          />
          <button
            type="submit"
            className="send"
            disabled={loading || !input.trim()}
            aria-label="Send question"
          >
            <IconArrowUp size={18} />
          </button>
        </form>
        <p className="composer-hint">
          <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line
        </p>
      </div>
    </section>
  );
}
