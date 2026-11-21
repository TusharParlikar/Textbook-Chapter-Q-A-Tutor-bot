
import { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";

const points = [
  { x: 1, y: 2, label: 0 },
  { x: 2, y: 1, label: 0 },
  { x: 2, y: 3, label: 0 },
  { x: 3, y: 2, label: 0 },
  { x: 3, y: 4, label: 0 },
  { x: 4, y: 3, label: 0 },
  { x: 5, y: 4, label: 0 },
  { x: 4, y: 5, label: 1 },
  { x: 5, y: 6, label: 1 },
  { x: 6, y: 5, label: 1 },
  { x: 6, y: 7, label: 1 },
  { x: 7, y: 6, label: 1 },
  { x: 8, y: 8, label: 1 },
  { x: 7, y: 8, label: 1 }
];

export default function KNN() {
  const chart = useRef<HTMLDivElement>(null);

  const [k, setK] = useState(3);
  const [qx, setQx] = useState(4.5);
  const [qy, setQy] = useState(4.5);
  const [metric, setMetric] = useState("euclidean");

  const neighbors = points.map(p => ({
    ...p,
    distance: metric === "euclidean"
      ? Math.hypot(p.x - qx, p.y - qy)
      : Math.abs(p.x - qx) + Math.abs(p.y - qy)
  }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);

  const votes = neighbors.filter(p => p.label === 1).length;
  const predicted = votes > k / 2 ? 1 : 0;

  const agreement = Math.max(votes, k - votes) / k;

  useEffect(() => {
    if (!chart.current) return;

    Plotly.react(chart.current, [
      {
        x: points.filter(p => p.label === 0).map(p => p.x),
        y: points.filter(p => p.label === 0).map(p => p.y),
        type: "scatter",
        mode: "markers",
        name: "Class A",
        marker: { color: "#3b82f6", size: 12 }
      },
      {
        x: points.filter(p => p.label === 1).map(p => p.x),
        y: points.filter(p => p.label === 1).map(p => p.y),
        type: "scatter",
        mode: "markers",
        name: "Class B",
        marker: { color: "#ef4444", size: 12 }
      },
      {
        x: neighbors.flatMap(p => [qx, p.x, null]),
        y: neighbors.flatMap(p => [qy, p.y, null]),
        type: "scatter",
        mode: "lines",
        name: "Nearest neighbors",
        line: { color: "#94a3b8", dash: "dash" }
      },
      {
        x: [qx],
        y: [qy],
        type: "scatter",
        mode: "markers",
        name: "Query point",
        marker: {
          color: predicted === 0 ? "#3b82f6" : "#ef4444",
          size: 20,
          symbol: "diamond",
          line: { color: "#111827", width: 2 }
        }
      }
    ], {
      title: { text: "KNN Classification" },
      height: 420,
      xaxis: { range: [0, 10] },
      yaxis: { range: [0, 10] },
      legend: { orientation: "h" },
      margin: { l: 40, r: 20, t: 50, b: 60 }
    }, {
      responsive: true,
      displaylogo: false
    });
  }, [k, qx, qy, metric]);

  useEffect(() => {
    const element = chart.current;
    return () => { if (element) Plotly.purge(element); };
  }, []);

  return (
    <section>
      <h2>KNN Classification Playground</h2>

      <p>
        Predicted Class:
        <strong style={{
          color: predicted === 0 ? "#3b82f6" : "#ef4444"
        }}>
          {predicted === 0 ? " Class A" : " Class B"}
        </strong>
      </p>

      <p>
        Neighbor Agreement: {(agreement * 100).toFixed(1)}%
      </p>

      <div ref={chart} />

      <label>Number of Neighbors: {k}</label>
      <input type="range" min="1" max="13" step="2"
        value={k}
        onChange={e => setK(Number(e.target.value))}
        style={{ width: "100%" }} />

      <label>Query Point X: {qx.toFixed(2)}</label>
      <input type="range" min="0" max="10" step="0.1"
        value={qx}
        onChange={e => setQx(Number(e.target.value))}
        style={{ width: "100%" }} />

      <label>Query Point Y: {qy.toFixed(2)}</label>
      <input type="range" min="0" max="10" step="0.1"
        value={qy}
        onChange={e => setQy(Number(e.target.value))}
        style={{ width: "100%" }} />

      <h3>Distance Metric</h3>

      <select value={metric}
        onChange={e => setMetric(e.target.value)}>
        <option value="euclidean">Euclidean Distance</option>
        <option value="manhattan">Manhattan Distance</option>
      </select>

      <h3>Neighbor Votes</h3>

      <p>Class A: {k - votes}</p>
      <p>Class B: {votes}</p>

      <button onClick={() => {
        setK(3);
        setQx(4.5);
        setQy(4.5);
        setMetric("euclidean");
      }}>
        Reset
      </button>
    </section>
  );
}
