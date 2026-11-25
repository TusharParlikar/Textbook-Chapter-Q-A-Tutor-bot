import { useState } from "react";

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
  solved?: Set<number>;
  onSelect: (problem: Problem) => void;
};

export default function ProblemList({ problems, selectedId, solved, onSelect }: Props) {
  const [filter, setFilter] = useState("");
  const q = filter.trim().toLowerCase();
  const shown = q
    ? problems.filter(p => `${p.title} ${p.topic}`.toLowerCase().includes(q))
    : problems;

  return (
    <aside className="arena-list">
      <div className="arena-list-head">
        <span className="kicker">Problems · {problems.length}</span>
      </div>

      <input
        className="field field-sm"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter by title or topic"
        aria-label="Filter problems"
      />

      <ul>
        {shown.map(problem => {
          const active = selectedId === problem.id;
          const done = solved?.has(problem.id);
          return (
            <li key={problem.id}>
              <button
                className={`problem-item${active ? " is-active" : ""}`}
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(problem)}
              >
                <span className={`problem-mark${done ? " is-done" : ""}`}>
                  {done ? "✓" : String(problem.id).padStart(2, "0")}
                </span>
                <span className="problem-text">
                  <span className="problem-title">{problem.title}</span>
                  <span className="problem-meta">
                    {problem.topic}
                    <span className={`diff diff-${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {shown.length === 0 && <li className="problem-none">No problems match.</li>}
      </ul>
    </aside>
  );
}
