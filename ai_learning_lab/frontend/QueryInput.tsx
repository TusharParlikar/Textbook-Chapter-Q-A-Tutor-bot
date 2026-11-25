type Props = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  loading: boolean;
};

const TOPICS = [
  "Linear Regression",
  "Logistic Regression",
  "K-Means",
  "KNN",
  "Gradient Descent",
  "Overfitting",
  "Neural Network",
];

export default function QueryInput({ value, onChange, onSearch, loading }: Props) {
  return (
    <div className="lab-query">
      <form
        className="lab-search"
        onSubmit={e => {
          e.preventDefault();
          if (value.trim()) onSearch(value.trim());
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.2-4.2" />
        </svg>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. Gradient descent, k-means, overfitting…"
          aria-label="Concept to explore"
        />
        <button className="btn btn-primary" disabled={loading || !value.trim()} type="submit">
          {loading ? "Building…" : "Explore"}
        </button>
      </form>

      <div className="lab-topics">
        <span className="kicker">Try</span>
        {TOPICS.map(t => (
          <button
            key={t}
            type="button"
            className="chip"
            disabled={loading}
            onClick={() => onSearch(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
