
import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
  loading: boolean;
};

export default function QueryInput({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("Linear Regression");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) onSearch(query.trim());
      }}
      style={{ display: "flex", gap: 12 }}
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask an AI/ML concept..."
        style={{
          flex: 1,
          padding: 14,
          borderRadius: 10,
          border: "1px solid #cbd5e1"
        }}
      />
      <button disabled={loading} type="submit">
        {loading ? "Generating..." : "Explore"}
      </button>
    </form>
  );
}
