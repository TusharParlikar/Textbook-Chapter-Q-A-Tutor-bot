
export type TestCase = {
  args: unknown[];
  expected: unknown;
};

export type Problem = {
  id: number;
  title: string;
  difficulty: string;
  topic: string;
  description: string;
  formula: string;
  functionName: string;
  starterCode: string;
  examples: { input: string; output: string }[];
  tests: TestCase[];
};

type Props = {
  problems: Problem[];
  selectedId: number;
  onSelect: (problem: Problem) => void;
};

export default function ProblemList({
  problems, selectedId, onSelect
}: Props) {
  return (
    <aside>
      <h3>Problems ({problems.length})</h3>

      {problems.map(problem => (
        <div
          key={problem.id}
          onClick={() => onSelect(problem)}
          style={{
            padding: 14,
            marginBottom: 8,
            borderRadius: 8,
            cursor: "pointer",
            border: selectedId === problem.id
              ? "2px solid #6366f1"
              : "1px solid #e2e8f0",
            background: selectedId === problem.id
              ? "#eef2ff" : "#fff"
          }}
        >
          <strong>{problem.id}. {problem.title}</strong>

          <p style={{ margin: "6px 0", fontSize: 13 }}>
            {problem.topic}
          </p>

          <span style={{
            fontSize: 12,
            color: problem.difficulty === "Easy"
              ? "#16a34a" : "#d97706"
          }}>
            {problem.difficulty}
          </span>
        </div>
      ))}
    </aside>
  );
}
