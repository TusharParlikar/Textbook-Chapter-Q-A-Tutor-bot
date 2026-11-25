import { useEffect, useState } from "react";
import QueryInput from "./QueryInput";
import Explanation, { type LearningResult } from "./Explanation";
import SimulationViewer from "./SimulationViewer";
import "./lab.css";

type Props = {
  /** A topic handed over from another part of the app; runs automatically. */
  pendingQuery?: { text: string; nonce: number } | null;
};

export default function Page({ pendingQuery }: Props) {
  const [result, setResult] = useState<LearningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("Linear Regression");

  async function handleSearch(text: string) {
    setQuery(text);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/learning-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || `The lab service answered with ${response.status}.`);
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Couldn't reach the Learning Lab service. Make sure its API is running on port 8000."
          : err instanceof Error
            ? err.message
            : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (pendingQuery) void handleSearch(pendingQuery.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery]);

  return (
    <section className="lab">
      <header className="page-head">
        <div>
          <p className="kicker tone-text-ochre">02 · Simulate</p>
          <h1>Learning Lab</h1>
          <p className="page-sub">Name a concept. Get a short explanation and a model you can play with.</p>
        </div>
      </header>

      <QueryInput
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      {error && (
        <div className="lab-alert" role="alert">
          <strong>Couldn't build that lesson.</strong> {error}
        </div>
      )}

      {loading && (
        <div className="lab-grid" aria-busy="true">
          <div className="lab-card skeleton">
            <span className="sk sk-title" />
            <span className="sk" />
            <span className="sk" />
            <span className="sk sk-short" />
            <span className="sk sk-block" />
          </div>
          <div className="lab-card skeleton">
            <span className="sk sk-title" />
            <span className="sk sk-chart" />
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="lab-grid">
          <Explanation data={result} />
          <div className="lab-card lab-sim">
            <SimulationViewer type={result.simulation} parameters={result.parameters} />
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="lab-blank">
          <svg viewBox="0 0 240 120" aria-hidden="true">
            <line x1="20" y1="104" x2="224" y2="104" stroke="var(--rule-strong)" />
            <line x1="20" y1="12" x2="20" y2="104" stroke="var(--rule-strong)" />
            <path d="M24 92 C 70 90, 90 30, 130 40 S 190 70, 220 22" stroke="var(--ochre)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {[[44, 86], [70, 70], [96, 46], [124, 44], [150, 56], [178, 50], [204, 32]].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="4" fill="var(--pine)" />
            ))}
          </svg>
          <p>Pick a topic above to start a simulation.</p>
        </div>
      )}
    </section>
  );
}
