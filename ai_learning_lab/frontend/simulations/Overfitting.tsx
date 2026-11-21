
import { useState, useEffect, useRef, useMemo } from "react";
import Plotly from "plotly.js-dist-min";
import { lusolve } from "mathjs";

type Point = { x: number; y: number };

function generateData(count: number, noise: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const x = (i / (count - 1)) * 6;

    return {
      x,
      y: Math.sin(x) + noise * Math.sin(i * 13.37)
    };
  });
}

function fitPolynomial(points: Point[], degree: number) {
  const n = degree + 1;

  const A = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      points.reduce(
        (sum, p) => sum + Math.pow((p.x - 3) / 3, i + j),
        0
      ) + (i === j ? 1e-8 : 0)
    )
  );

  const B = Array.from({ length: n }, (_, i) => [
    points.reduce(
      (sum, p) => sum + p.y * Math.pow((p.x - 3) / 3, i),
      0
    )
  ]);

  const result = lusolve(A, B) as number[][];
  return result.map(row => row[0]);
}

export default function Overfitting() {
  const chartRef = useRef<HTMLDivElement>(null);

  const [degree, setDegree] = useState(3);
  const [noise, setNoise] = useState(0.3);
  const [count, setCount] = useState(15);
  const [points, setPoints] = useState(
    generateData(15, 0.3)
  );

  const [selected, setSelected] = useState(0);

  const coefficients = useMemo(
    () => fitPolynomial(points, degree),
    [points, degree]
  );

  const predict = (x: number) =>
    coefficients.reduce(
      (sum, c, i) =>
        sum + c * Math.pow((x - 3) / 3, i),
      0
    );

  const curveX = Array.from(
    { length: 150 },
    (_, i) => i * 6 / 149
  );

  const trainingMSE = points.reduce(
    (sum, p) => sum + (p.y - predict(p.x)) ** 2,
    0
  ) / points.length;

  const validationX = Array.from(
    { length: 100 },
    (_, i) => (i + 0.5) * 6 / 100
  );

  const validationMSE = validationX.reduce(
    (sum, x) => sum + (Math.sin(x) - predict(x)) ** 2,
    0
  ) / validationX.length;

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    Plotly.react(
      element,
      [
        {
          x: curveX,
          y: curveX.map(x => Math.sin(x)),
          type: "scatter",
          mode: "lines",
          name: "True function",
          line: { color: "#10b981", dash: "dash" }
        },
        {
          x: points.map(p => p.x),
          y: points.map(p => p.y),
          type: "scatter",
          mode: "markers",
          name: "Training data",
          marker: {
            color: points.map((_, i) =>
              i === selected ? "#ef4444" : "#3b82f6"
            ),
            size: 10
          }
        },
        {
          x: curveX,
          y: curveX.map(predict),
          type: "scatter",
          mode: "lines",
          name: "Model prediction",
          line: { color: "#8b5cf6", width: 3 }
        }
      ],
      {
        title: { text: "Model Complexity vs Generalization" },
        height: 420,
        autosize: true,
        xaxis: { title: { text: "Input (X)" } },
        yaxis: { title: { text: "Prediction (Y)" } },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#f8fafc",
        legend: { orientation: "h", y: -0.2 },
        margin: { l: 55, r: 20, t: 55, b: 95 }
      },
      {
        responsive: true,
        displaylogo: false
      }
    );
  }, [points, degree, selected]);

  useEffect(() => {
    const element = chartRef.current;
    return () => {
      if (element) Plotly.purge(element);
    };
  }, []);

  function updateDataset(n: number, randomNoise: number) {
    setCount(n);
    setNoise(randomNoise);
    setPoints(generateData(n, randomNoise));
    setSelected(0);
  }

  function updatePoint(axis: "x" | "y", value: number) {
    setPoints(previous =>
      previous.map((p, i) =>
        i === selected ? { ...p, [axis]: value } : p
      )
    );
  }

  return (
    <section>
      <h2>Overfitting Playground</h2>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: 16,
        background: "#f1f5f9",
        borderRadius: 12
      }}>
        <div>
          Training MSE
          <h2>{trainingMSE.toFixed(4)}</h2>
        </div>

        <div>
          Validation MSE
          <h2>{validationMSE.toFixed(4)}</h2>
        </div>
      </div>

      <div ref={chartRef} style={{ width: "100%" }} />

      <label>Polynomial Degree: {degree}</label>
      <input
        type="range"
        min="1"
        max="10"
        value={degree}
        onChange={e => setDegree(Number(e.target.value))}
        style={{ width: "100%" }}
      />

      <label>Dataset Noise: {noise.toFixed(2)}</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={noise}
        onChange={e =>
          updateDataset(count, Number(e.target.value))
        }
        style={{ width: "100%" }}
      />

      <label>Training Samples: {count}</label>
      <input
        type="range"
        min="12"
        max="50"
        value={count}
        onChange={e =>
          updateDataset(Number(e.target.value), noise)
        }
        style={{ width: "100%" }}
      />

      <h3>Edit Training Points</h3>

      <select
        value={selected}
        onChange={e => setSelected(Number(e.target.value))}
      >
        {points.map((_, i) => (
          <option key={i} value={i}>
            Point {i + 1}
          </option>
        ))}
      </select>

      <p>X: {points[selected].x.toFixed(2)}</p>
      <input
        type="range"
        min="0"
        max="6"
        step="0.05"
        value={points[selected].x}
        onChange={e =>
          updatePoint("x", Number(e.target.value))
        }
        style={{ width: "100%" }}
      />

      <p>Y: {points[selected].y.toFixed(2)}</p>
      <input
        type="range"
        min="-3"
        max="3"
        step="0.05"
        value={points[selected].y}
        onChange={e =>
          updatePoint("y", Number(e.target.value))
        }
        style={{ width: "100%" }}
      />

      <h3>Experiment Observation</h3>

      <p>
        {validationMSE > trainingMSE * 3
          ? "The model may be overfitting. Compare training and validation errors."
          : "Experiment with complexity and noise to observe generalization."}
      </p>

      <button onClick={() => {
        setDegree(3);
        updateDataset(15, 0.3);
      }}>
        Reset Experiment
      </button>
    </section>
  );
}
