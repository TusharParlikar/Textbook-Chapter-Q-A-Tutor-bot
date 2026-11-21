
import { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";

type Point = { x: number; y: number };

const colors = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#ec4899"
];

function generatePoints(): Point[] {
  return Array.from({ length: 45 }, (_, i) => {
    const centers = [[2, 2], [7, 7], [2, 8]];
    const c = centers[i % 3];

    return {
      x: c[0] + Math.sin(i * 7.3) * 1.5,
      y: c[1] + Math.cos(i * 5.7) * 1.5
    };
  });
}

const initialPoints = generatePoints();

function initialize(k: number): Point[] {
  return Array.from({ length: k }, (_, i) => ({
    x: 1 + i * 7 / Math.max(1, k - 1),
    y: 3 + (i % 2) * 2
  }));
}

function distance(a: Point, b: Point) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function nearest(p: Point, centers: Point[]) {
  return centers.reduce(
    (best, c, i) =>
      distance(p, c) < distance(p, centers[best])
        ? i : best,
    0
  );
}

export default function KMeans() {
  const chart = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(3);
  const [points, setPoints] = useState(initialPoints);
  const [centers, setCenters] = useState(initialize(3));
  const [iteration, setIteration] = useState(0);
  const [selected, setSelected] = useState(0);

  const assignments = points.map(p => nearest(p, centers));

  const inertia = points.reduce(
    (sum, p, i) =>
      sum + distance(p, centers[assignments[i]]), 0
  );

  function run(steps: number) {
    let current = centers;

    for (let step = 0; step < steps; step++) {
      const groups = Array.from(
        { length: k }, () => [] as Point[]
      );

      points.forEach(p =>
        groups[nearest(p, current)].push(p)
      );

      current = groups.map((group, i) =>
        group.length ? {
          x: group.reduce((s, p) => s + p.x, 0) / group.length,
          y: group.reduce((s, p) => s + p.y, 0) / group.length
        } : current[i]
      );
    }

    setCenters(current);
    setIteration(n => n + steps);
  }

  function updatePoint(axis: "x" | "y", value: number) {
    setPoints(previous => previous.map((p, i) =>
      i === selected ? { ...p, [axis]: value } : p
    ));
    setIteration(0);
  }

  useEffect(() => {
    if (!chart.current) return;

    Plotly.react(chart.current, [
      {
        x: points.map(p => p.x),
        y: points.map(p => p.y),
        type: "scatter",
        mode: "markers",
        name: "Data points",
        marker: {
          color: assignments.map(i => colors[i]),
          size: points.map((_, i) =>
            i === selected ? 15 : 9
          )
        }
      },
      {
        x: centers.map(p => p.x),
        y: centers.map(p => p.y),
        type: "scatter",
        mode: "markers",
        name: "Centroids",
        marker: {
          color: centers.map((_, i) => colors[i]),
          size: 20,
          symbol: "x",
          line: { width: 2, color: "#111827" }
        }
      }
    ], {
      title: { text: "K-Means Cluster Formation" },
      height: 420,
      xaxis: { range: [0, 10] },
      yaxis: { range: [0, 10] },
      legend: { orientation: "h" },
      margin: { l: 40, r: 20, t: 50, b: 50 }
    }, {
      responsive: true,
      displaylogo: false
    });
  }, [points, centers, selected]);

  useEffect(() => {
    const element = chart.current;
    return () => { if (element) Plotly.purge(element); };
  }, []);

  return (
    <section>
      <h2>K-Means Clustering Playground</h2>

      <p>
        Iteration: <b>{iteration}</b>
        {" | "} Inertia: <b>{inertia.toFixed(2)}</b>
      </p>

      <div ref={chart} />

      <label>Number of Clusters: {k}</label>

      <input type="range" min="2" max="5"
        value={k}
        onChange={e => {
          const n = Number(e.target.value);
          setK(n);
          setCenters(initialize(n));
          setIteration(0);
        }}
        style={{ width: "100%" }} />

      <button onClick={() => run(1)}>Next Iteration</button>
      {" "}
      <button onClick={() => run(20)}>Run 20 Iterations</button>

      <h3>Edit Data Points</h3>

      <select value={selected}
        onChange={e => setSelected(Number(e.target.value))}>
        {points.map((_, i) =>
          <option key={i} value={i}>Point {i + 1}</option>
        )}
      </select>

      <p>X: {points[selected].x.toFixed(2)}</p>
      <input type="range" min="0" max="10" step="0.1"
        value={points[selected].x}
        onChange={e => updatePoint("x", Number(e.target.value))}
        style={{ width: "100%" }} />

      <p>Y: {points[selected].y.toFixed(2)}</p>
      <input type="range" min="0" max="10" step="0.1"
        value={points[selected].y}
        onChange={e => updatePoint("y", Number(e.target.value))}
        style={{ width: "100%" }} />

      <button onClick={() => {
        setPoints(initialPoints);
        setCenters(initialize(k));
        setSelected(0);
        setIteration(0);
      }}>
        Reset Experiment
      </button>
    </section>
  );
}
