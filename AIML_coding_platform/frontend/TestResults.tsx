
import type {
  ExecutionResult,
  GradingResult
} from "./executor";

type Props = {
  result: ExecutionResult | null;
  grading: GradingResult | null;
  error: string;
};

export default function TestResults({
  result, grading, error
}: Props) {
  return (
    <section style={{
      background: "#111827",
      color: "white",
      padding: 20,
      borderRadius: 10,
      marginTop: 16
    }}>
      <h3>Execution Results</h3>

      {error && <pre style={{
        color: "#f87171",
        whiteSpace: "pre-wrap"
      }}>{error}</pre>}

      {result && (
        <>
          <p style={{
            color: result.success ? "#4ade80" : "#f87171"
          }}>
            {result.success ? "Executed" : "Execution Failed"}
          </p>

          <pre style={{ whiteSpace: "pre-wrap" }}>
            {result.output || "(No printed output)"}
          </pre>

          {result.error && (
            <pre style={{ color: "#f87171" }}>
              {result.error}
            </pre>
          )}

          <p>Runtime: {result.runtime.toFixed(2)} ms</p>
        </>
      )}

      {grading && (
        <>
          <h3 style={{
            color: grading.passed === grading.total
              ? "#4ade80" : "#fbbf24"
          }}>
            {grading.passed === grading.total
              ? "Accepted"
              : "Wrong Answer"}
          </h3>

          <p>
            {grading.passed}/{grading.total} test cases passed
          </p>

          {grading.results.map((test, i) => (
            <div key={i} style={{
              padding: 10,
              borderBottom: "1px solid #334155"
            }}>
              <strong style={{
                color: test.passed ? "#4ade80" : "#f87171"
              }}>
                Test {i + 1}: {test.passed ? "Passed" : "Failed"}
              </strong>

              {!test.passed && (
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  Expected: {JSON.stringify(test.expected)}
                  {"\n"}
                  Actual: {JSON.stringify(test.actual)}
                  {test.error ? "\nError: " + test.error : ""}
                </pre>
              )}
            </div>
          ))}
        </>
      )}
    </section>
  );
}
