
import { useState } from "react";
import QueryInput from "./QueryInput";
import Explanation, { type LearningResult } from "./Explanation";
import SimulationViewer from "./SimulationViewer";

export default function Page() {
  const [result, setResult] = useState<LearningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(query: string) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/learning-lab",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Request failed");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      maxWidth: 1050,
      margin: "40px auto",
      padding: 24,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>AI Learning Lab</h1>
      <p>Explore AI and Data Science through interactive simulations.</p>

      <QueryInput onSearch={handleSearch} loading={loading} />

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
          gap: 30,
          marginTop: 30
        }}>
          <Explanation data={result} />
          <SimulationViewer
            type={result.simulation}
            parameters={result.parameters}
            />
        </div>
      )}
    </main>
  );
}
