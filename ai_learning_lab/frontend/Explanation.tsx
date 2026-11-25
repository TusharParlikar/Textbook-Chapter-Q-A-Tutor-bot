export type LearningResult = {
  title: string;
  explanation: string;
  formula: string;
  steps: string[];
  simulation: string;
  parameters: Record<string, unknown>;
};

export default function Explanation({ data }: { data: LearningResult }) {
  return (
    <article className="lab-card lab-explain">
      <p className="kicker">Concept</p>
      <h2>{data.title}</h2>
      <p className="lab-prose">{data.explanation}</p>

      {data.formula && (
        <>
          <h3>Formula</h3>
          <pre className="formula">{data.formula}</pre>
        </>
      )}

      {!!data.steps?.length && (
        <>
          <h3>Key points</h3>
          <ol className="lab-steps">
            {data.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </>
      )}
    </article>
  );
}
