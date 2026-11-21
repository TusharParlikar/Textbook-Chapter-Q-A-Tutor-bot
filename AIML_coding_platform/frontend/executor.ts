
export type ExecutionResult = {
  success: boolean;
  output: string;
  error: string;
  runtime: number;
};

export function executeCode(
  code: string
): Promise<ExecutionResult> {

  return new Promise((resolve) => {

    const worker = new Worker(
      new URL("./python.worker.ts", import.meta.url),
      { type: "module" }
    );

    const finish = (result: ExecutionResult) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(result);
    };

    const timeout = setTimeout(() => {
      finish({
        success: false,
        output: "",
        error: "Execution timed out.",
        runtime: 0
      });
    }, 120000);

    worker.onmessage = event => {
      finish(event.data);
    };

    worker.onerror = event => {
      finish({
        success: false,
        output: "",
        error: event.message || "Python worker failed.",
        runtime: 0
      });
    };

    worker.postMessage({ code });
  });
}

import type { Problem } from "./ProblemList";

export type GradingResult = {
  passed: number;
  total: number;
  results: {
    passed: boolean;
    expected: unknown;
    actual: unknown;
    error?: string;
  }[];
};

export async function submitSolution(
  code: string,
  problem: Problem
): Promise<GradingResult> {

  const testData = JSON.stringify(problem.tests);

  const harness = `
import json
import math

_lab_tests = json.loads(${JSON.stringify(testData)})
_lab_results = []

def _lab_normalize(value):
    if hasattr(value, "tolist"):
        return _lab_normalize(value.tolist())
    if hasattr(value, "item"):
        return _lab_normalize(value.item())
    if isinstance(value, (list, tuple)):
        return [_lab_normalize(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _lab_normalize(v) for k, v in value.items()}
    return value

def _lab_equal(a, b):
    a = _lab_normalize(a)
    b = _lab_normalize(b)

    if isinstance(a, bool) or isinstance(b, bool):
        return type(a) is type(b) and a == b

    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return math.isclose(a, b, rel_tol=1e-5, abs_tol=1e-6)

    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(
            _lab_equal(x, y) for x, y in zip(a, b)
        )

    return a == b

for case in _lab_tests:
    try:
        actual = ${problem.functionName}(*case["args"])
        actual = _lab_normalize(actual)
        passed = _lab_equal(actual, case["expected"])

        _lab_results.append({
            "passed": passed,
            "expected": case["expected"],
            "actual": actual
        })
    except Exception as exc:
        _lab_results.append({
            "passed": False,
            "expected": case["expected"],
            "actual": None,
            "error": str(exc)
        })

print("__AIML_GRADE__" + json.dumps(_lab_results))
`;

  const execution = await executeCode(code + "\n" + harness);

  if (!execution.success) {
    throw new Error(execution.error || "Execution failed");
  }

  const marker = "__AIML_GRADE__";
  const index = execution.output.lastIndexOf(marker);

  if (index === -1) {
    throw new Error("No grading results returned.");
  }

  const line = execution.output
    .slice(index + marker.length)
    .split("\n")[0];

  const results = JSON.parse(line) as GradingResult["results"];

  return {
    passed: results.filter(r => r.passed).length,
    total: results.length,
    results
  };
}
