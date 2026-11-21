
import type { Problem } from "./ProblemList";

export default function ProblemDescription({
  problem
}: {
  problem: Problem;
}) {
  return (
    <section>
      <h2>{problem.title}</h2>

      <p>
        <strong>{problem.difficulty}</strong>
        {" · "}
        {problem.topic}
      </p>

      <h3>Problem Statement</h3>
      <p>{problem.description}</p>

      <h3>Formula</h3>
      <pre style={{
        whiteSpace: "pre-wrap",
        background: "#f1f5f9",
        padding: 12,
        borderRadius: 8
      }}>
        {problem.formula}
      </pre>

      <h3>Example</h3>

      {problem.examples.map((example, i) => (
        <div key={i}>
          <p><strong>Input:</strong></p>
          <pre>{example.input}</pre>

          <p><strong>Expected Output:</strong></p>
          <pre>{example.output}</pre>
        </div>
      ))}

      <h3>Instructions</h3>
      <p>
        Complete the provided function.
        Click Run Code to execute your program,
        or Submit Solution to evaluate it.
      </p>
    </section>
  );
}
