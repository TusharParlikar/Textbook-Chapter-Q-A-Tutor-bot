
import { loadPyodide } from "pyodide";

const runtime = loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"
});

self.onmessage = async (event: MessageEvent) => {
  const { code } = event.data;

  const stdout: string[] = [];
  const stderr: string[] = [];

  try {
    const pyodide = await runtime;

    await pyodide.loadPackagesFromImports(code);

    pyodide.setStdout({
      batched: text => stdout.push(text)
    });

    pyodide.setStderr({
      batched: text => stderr.push(text)
    });

    const globals = pyodide.toPy({});
    const start = performance.now();

    try {
      const result = await pyodide.runPythonAsync(code, {
        globals
      });

      if (result && typeof result.destroy === "function") {
        result.destroy();
      }

      self.postMessage({
        success: true,
        output: stdout.join("\n"),
        error: stderr.join("\n"),
        runtime: performance.now() - start
      });

    } finally {
      globals.destroy();
    }

  } catch (error) {
    self.postMessage({
      success: false,
      output: stdout.join("\n"),
      error: String(error),
      runtime: 0
    });
  }
};
