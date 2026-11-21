export type LearningResult = {
  title: string;
  explanation: string;
  formula: string;
  steps: string[];
  simulation: string;
  parameters: Record<string, unknown>;
};

export default function Explanation({
  data
}: {
  data: LearningResult;
}) {
  return (
    <section>
      <h2>{data.title}</h2>
      <p>{data.explanation}</p>

      <h3>Formula</h3>
      <p><code>{data.formula}</code></p>

      <h3>Key Learning Points</h3>
      <ul>
        {data.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ul>
    </section>
  );
}