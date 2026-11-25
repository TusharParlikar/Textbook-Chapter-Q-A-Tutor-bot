import type { ExecutionResult, GradingResult } from "./executor";

type Props = {
  result: ExecutionResult | null;
  grading: GradingResult | null;
  error: string;
  running?: "run" | "submit" | null;
};

export default function TestResults({ result, grading, error, running }: Props) {
  const accepted = grading && grading.total > 0 && grading.passed === grading.total;

  return (
    <section className="console" aria-live="polite">
      <div className="console-head">
        <span className="kicker">Console</span>
        {result && <span className="console-runtime">{result.runtime.toFixed(1)} ms</span>}
      </div>

      <div className="console-body">
        {running && (
          <p className="console-muted">
            {running === "run" ? "Running Python…" : "Grading your solution…"}
            {" "}The first run loads Python in the browser and can take a few seconds.
          </p>
        )}

        {!running && !result && !grading && !error && (
          <p className="console-muted">Run your code to see printed output here.</p>
        )}

        {error && <pre className="out-bad">{error}</pre>}

        {result && (
          <>
            <p className={result.success ? "out-ok" : "out-bad"}>
              {result.success ? "● Ran successfully" : "● Execution failed"}
            </p>
            <pre>{result.output || "(no printed output)"}</pre>
            {result.error && <pre className="out-bad">{result.error}</pre>}
          </>
        )}

        {grading && (
          <>
            <div className="verdict">
              <span className={accepted ? "out-ok" : "out-warn"}>
                {accepted ? "Accepted" : "Not quite"}
              </span>
              <span className="console-muted">
                {grading.passed}/{grading.total} tests passed
              </span>
            </div>

            <div className="meter" role="progressbar" aria-valuenow={grading.passed} aria-valuemax={grading.total}>
              <span style={{ width: `${grading.total ? (grading.passed / grading.total) * 100 : 0}%` }} />
            </div>

            <ol className="tests">
              {grading.results.map((test, i) => (
                <li key={i} className={test.passed ? "is-pass" : "is-fail"}>
                  <span className="test-name">
                    {test.passed ? "✓" : "✕"} Test {i + 1}
                  </span>
                  {!test.passed && (
                    <pre>
                      expected {JSON.stringify(test.expected)}
                      {"\n"}got      {JSON.stringify(test.actual)}
                      {test.error ? `\n${test.error}` : ""}
                    </pre>
                  )}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
