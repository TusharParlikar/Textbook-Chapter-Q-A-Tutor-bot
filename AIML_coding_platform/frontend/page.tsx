import { useState } from "react";

import problemsData from "../data/problems.json";
import ProblemList, { type Problem } from "./ProblemList";
import ProblemDescription from "./ProblemDescription";
import CodeEditor from "./CodeEditor";
import TestResults from "./TestResults";
import "./arena.css";

import {
  executeCode,
  submitSolution,
  type ExecutionResult,
  type GradingResult,
} from "./executor";

const problems = problemsData as Problem[];

export default function Page() {
  const [selected, setSelected] = useState(problems[0]);
  const [code, setCode] = useState(problems[0].starterCode);
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [grading, setGrading] = useState<GradingResult | null>(null);
  const [error, setError] = useState("");
  const [solved, setSolved] = useState<Set<number>>(() => new Set());

  function selectProblem(problem: Problem) {
    setSelected(problem);
    setCode(problem.starterCode);
    setResult(null);
    setGrading(null);
    setError("");
  }

  async function run() {
    setRunning("run");
    setResult(null);
    setGrading(null);
    setError("");

    try {
      setResult(await executeCode(code));
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(null);
    }
  }

  async function submit() {
    setRunning("submit");
    setResult(null);
    setGrading(null);
    setError("");

    try {
      const graded = await submitSolution(code, selected);
      setGrading(graded);
      if (graded.total > 0 && graded.passed === graded.total) {
        setSolved(prev => new Set(prev).add(selected.id));
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(null);
    }
  }

  return (
    <section className="arena">
      <header className="page-head">
        <div>
          <p className="kicker tone-text-vermilion">03 · Solve</p>
          <h1>Coding Arena</h1>
          <p className="page-sub">Implement the maths behind ML in Python. Code runs in your browser.</p>
        </div>
        <div className="arena-progress" aria-label="Progress">
          <span className="arena-progress-n">{solved.size}</span>
          <span className="kicker">of {problems.length} solved</span>
        </div>
      </header>

      <div className="arena-grid">
        <ProblemList
          problems={problems}
          selectedId={selected.id}
          solved={solved}
          onSelect={selectProblem}
        />

        <ProblemDescription problem={selected} />

        <div className="arena-work">
          <div className="editor-frame">
            <div className="editor-bar">
              <span className="editor-file">
                <span className="dot" />
                {selected.functionName}.py
              </span>
              <div className="editor-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setCode(selected.starterCode)}
                  disabled={!!running || code === selected.starterCode}
                >
                  Reset
                </button>
                <button className="btn btn-ghost btn-sm" onClick={run} disabled={!!running}>
                  {running === "run" ? "Running…" : "Run"}
                </button>
                <button className="btn btn-accent btn-sm" onClick={submit} disabled={!!running}>
                  {running === "submit" ? "Grading…" : "Submit"}
                </button>
              </div>
            </div>

            <CodeEditor code={code} onChange={setCode} />
          </div>

          <TestResults result={result} grading={grading} error={error} running={running} />
        </div>
      </div>
    </section>
  );
}
