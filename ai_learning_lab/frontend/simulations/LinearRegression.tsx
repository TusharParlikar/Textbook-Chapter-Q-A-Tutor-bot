
import { useState } from "react";

const points = [
  [1, 2.5], [2, 3.2], [3, 5.1],
  [4, 5.8], [5, 7.2], [6, 8.4],
  [7, 9.1], [8, 10.8]
];

export default function LinearRegression() {
  const [slope, setSlope] = useState(1.2);
  const [intercept, setIntercept] = useState(1);

  const predict = (x: number) => slope * x + intercept;

  const mse = points.reduce((sum, [x, y]) => {
    return sum + Math.pow(y - predict(x), 2);
  }, 0) / points.length;

  const sx = (x: number) => 40 + x * 42;
  const sy = (y: number) => 310 - y * 24;

  return (
    <section>
      <h2>Interactive Linear Regression</h2>
      <p>Adjust the parameters to fit the data points.</p>

      <svg
        viewBox="0 0 450 340"
        style={{
          width: "100%",
          background: "#f8fafc",
          borderRadius: 12
        }}
      >
        <line x1="40" y1="20" x2="40" y2="310"
          stroke="#64748b" />

        <line x1="40" y1="310" x2="420" y2="310"
          stroke="#64748b" />

        {points.map(([x, y], i) => (
          <g key={i}>
            <line
              x1={sx(x)}
              y1={sy(y)}
              x2={sx(x)}
              y2={sy(predict(x))}
              stroke="#f59e0b"
              strokeDasharray="4"
            />

            <circle
              cx={sx(x)}
              cy={sy(y)}
              r="5"
              fill="#2563eb"
            />
          </g>
        ))}

        <line
          x1={sx(0)}
          y1={sy(predict(0))}
          x2={sx(9)}
          y2={sy(predict(9))}
          stroke="#ef4444"
          strokeWidth="3"
        />
      </svg>

      <label>Slope: {slope.toFixed(2)}</label>

      <input
        type="range"
        min="-1"
        max="2.5"
        step="0.05"
        value={slope}
        onChange={(e) => setSlope(Number(e.target.value))}
        style={{ width: "100%" }}
      />

      <label>Intercept: {intercept.toFixed(2)}</label>

      <input
        type="range"
        min="-2"
        max="5"
        step="0.1"
        value={intercept}
        onChange={(e) => setIntercept(Number(e.target.value))}
        style={{ width: "100%" }}
      />

      <h3>
        y = {slope.toFixed(2)}x + {intercept.toFixed(2)}
      </h3>

      <p>Mean Squared Error: <strong>{mse.toFixed(3)}</strong></p>

      <button onClick={() => {
        setSlope(1.2);
        setIntercept(1);
      }}>
        Reset
      </button>
    </section>
  );
}
