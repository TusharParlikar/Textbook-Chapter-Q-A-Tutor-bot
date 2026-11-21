
import { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";

const initialPoints = [
  { x: -4, y: 0 }, { x: -3, y: 0 },
  { x: -2, y: 0 }, { x: -1, y: 0 },
  { x: 0, y: 1 }, { x: 1, y: 0 },
  { x: 2, y: 1 }, { x: 3, y: 1 },
  { x: 4, y: 1 }
];

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export default function LogisticRegression() {
  const chart = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState(initialPoints);
  const [weight, setWeight] = useState(1.2);
  const [bias, setBias] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [lr, setLr] = useState(0.1);
  const [selected, setSelected] = useState(0);
  const [epoch, setEpoch] = useState(0);

  const predict = (x: number) => sigmoid(weight * x + bias);

  const accuracy = points.filter(
    p => Number(predict(p.x) >= threshold) === p.y
  ).length / points.length;

  const loss = -points.reduce((sum, p) => {
    const probability = Math.max(
      1e-7, Math.min(1 - 1e-7, predict(p.x))
    );

    return sum + p.y * Math.log(probability)
      + (1 - p.y) * Math.log(1 - probability);
  }, 0) / points.length;

  function train(iterations: number) {
    let w = weight;
    let b = bias;

    for (let i = 0; i < iterations; i++) {
      let dw = 0;
      let db = 0;

      points.forEach(p => {
        const error = sigmoid(w * p.x + b) - p.y;
        dw += error * p.x;
        db += error;
      });

      w -= lr * dw / points.length;
      b -= lr * db / points.length;
    }

    setWeight(w);
    setBias(b);
    setEpoch(e => e + iterations);
  }

  function editPoint(x: number, y: number) {
    setPoints(previous => previous.map(
      (p, i) => i === selected ? { x, y } : p
    ));
    setEpoch(0);
  }

  useEffect(() => {
    if (!chart.current) return;

    const xs = Array.from(
      { length: 150 }, (_, i) => -6 + i * 12 / 149
    );

    Plotly.react(chart.current, [
      {
        x: xs,
        y: xs.map(predict),
        name: "Predicted probability",
        type: "scatter",
        mode: "lines",
        line: { color: "#8b5cf6", width: 3 }
      },
      {
        x: points.map(p => p.x),
        y: points.map(p => p.y),
        name: "Training observations",
        type: "scatter",
        mode: "markers",
        marker: {
          size: 12,
          color: points.map(p =>
            p.y === 1 ? "#10b981" : "#ef4444"
          )
        }
      },
      {
        x: [-6, 6],
        y: [threshold, threshold],
        name: "Classification threshold",
        type: "scatter",
        mode: "lines",
        line: { color: "#f59e0b", dash: "dash" }
      }
    ], {
      title: { text: "Binary Classification" },
      height: 400,
      xaxis: { title: { text: "Feature X" } },
      yaxis: {
        title: { text: "Probability" },
        range: [-0.1, 1.1]
      },
      legend: { orientation: "h", y: -0.2 },
      margin: { l: 50, r: 20, t: 50, b: 90 }
    }, {
      responsive: true,
      displaylogo: false
    });
  }, [weight, bias, threshold, points]);

  useEffect(() => {
    const element = chart.current;
    return () => { if (element) Plotly.purge(element); };
  }, []);

  return (
    <section>
      <h2>Logistic Regression Playground</h2>

      <p>
        Accuracy: <b>{(accuracy * 100).toFixed(1)}%</b>
        {" | "} Log Loss: <b>{loss.toFixed(4)}</b>
        {" | "} Epoch: <b>{epoch}</b>
      </p>

      <div ref={chart} />

      <label>Weight: {weight.toFixed(2)}</label>
      <input type="range" min="-10" max="10" step="0.05"
        value={weight}
        onChange={e => setWeight(Number(e.target.value))}
        style={{ width: "100%" }} />

      <label>Bias: {bias.toFixed(2)}</label>
      <input type="range" min="-5" max="5" step="0.05"
        value={bias}
        onChange={e => setBias(Number(e.target.value))}
        style={{ width: "100%" }} />

      <label>Threshold: {threshold.toFixed(2)}</label>
      <input type="range" min="0.05" max="0.95" step="0.05"
        value={threshold}
        onChange={e => setThreshold(Number(e.target.value))}
        style={{ width: "100%" }} />

      <label>Learning Rate: {lr.toFixed(2)}</label>
      <input type="range" min="0.01" max="1" step="0.01"
        value={lr}
        onChange={e => setLr(Number(e.target.value))}
        style={{ width: "100%" }} />

      <h3>Edit Training Data</h3>

      <select value={selected}
        onChange={e => setSelected(Number(e.target.value))}>
        {points.map((_, i) =>
          <option key={i} value={i}>Point {i + 1}</option>
        )}
      </select>

      <p>X: {points[selected].x.toFixed(2)}</p>

      <input type="range" min="-5" max="5" step="0.1"
        value={points[selected].x}
        onChange={e =>
          editPoint(Number(e.target.value), points[selected].y)
        }
        style={{ width: "100%" }} />

      <button onClick={() =>
        editPoint(points[selected].x, 1 - points[selected].y)
      }>
        Flip Class ({points[selected].y})
      </button>

      <h3>Train Model</h3>

      <button onClick={() => train(1)}>Next Epoch</button>
      {" "}
      <button onClick={() => train(100)}>Train 100 Epochs</button>
      {" "}
      <button onClick={() => {
        setWeight(1.2);
        setBias(0);
        setThreshold(0.5);
        setLr(0.1);
        setPoints(initialPoints);
        setSelected(0);
        setEpoch(0);
      }}>
        Reset
      </button>
    </section>
  );
}
