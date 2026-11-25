import type { Problem } from "./ProblemList";

export default function ProblemDescription({ problem }: { problem: Problem }) {
  return (
    <article className="arena-brief">
      <div className="brief-meta">
        <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
        <span className="badge">{problem.topic}</span>
      </div>

      <h2>{problem.title}</h2>
      <p className="brief-prose">{problem.description}</p>

      <h3>Formula</h3>
      <pre className="formula">{problem.formula}</pre>

      <h3>Example</h3>
      {problem.examples.map((example, i) => (
        <div key={i} className="example">
          <div>
            <span className="kicker">Input</span>
            <pre>{example.input}</pre>
          </div>
          <div>
            <span className="kicker">Expected</span>
            <pre>{example.output}</pre>
          </div>
        </div>
      ))}

      <p className="brief-note">
        Complete <code>{problem.functionName}</code>. <strong>Run</strong> executes your code;{" "}
        <strong>Submit</strong> grades it against {problem.tests.length} hidden tests.
      </p>
    </article>
  );
}
