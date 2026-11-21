
import { useState } from "react";

import problemsData from "../data/problems.json";
import ProblemList, { type Problem } from "./ProblemList";
import ProblemDescription from "./ProblemDescription";
import CodeEditor from "./CodeEditor";
import TestResults from "./TestResults";

import {
  executeCode,
  submitSolution,
  type ExecutionResult,
  type GradingResult
} from "./executor";

const problems = problemsData as Problem[];

export default function Page() {
  const [selected, setSelected] = useState(problems[0]);
  const [code, setCode] = useState(problems[0].starterCode);
  const [running, setRunning] = useState(false);

  const [result, setResult] =
    useState<ExecutionResult | null>(null);

  const [grading, setGrading] =
    useState<GradingResult | null>(null);

  const [error, setError] = useState("");

  function selectProblem(problem: Problem) {
    setSelected(problem);
    setCode(problem.starterCode);
    setResult(null);
    setGrading(null);
    setError("");
  }

  async function run() {
    setRunning(true);
    setResult(null);
    setGrading(null);
    setError("");

    try {
      setResult(await executeCode(code));
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(false);
    }
  }

  async function submit() {
    setRunning(true);
    setResult(null);
    setGrading(null);
    setError("");

    try {
      setGrading(await submitSolution(code, selected));
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main style={{
      maxWidth: 1500,
      margin: "20px auto",
      padding: 20,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>AI/ML Coding Platform</h1>
      <p>Learn, implement and test machine learning algorithms.</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "240px minmax(0, 1fr)",
        gap: 20
      }}>
        <ProblemList
          problems={problems}
          selectedId={selected.id}
          onSelect={selectProblem}
        />

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
          gap: 20
        }}>
          <ProblemDescription problem={selected} />

          <div style={{ minWidth: 0 }}>
            <div style={{ marginBottom: 15 }}>
              <button
                onClick={run}
                disabled={running}
                style={{ padding: "12px 20px", marginRight: 10 }}
              >
                Run Code
              </button>

              <button
                onClick={submit}
                disabled={running}
                style={{
                  padding: "12px 20px",
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6
                }}
              >
                Submit Solution
              </button>
            </div>

            <CodeEditor code={code} onChange={setCode} />

            {running && <p>Executing Python...</p>}

            <TestResults
              result={result}
              grading={grading}
              error={error}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
