
import { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";

export default function GradientDescent() {
  const chart = useRef<HTMLDivElement>(null);

  const [lr, setLr] = useState(0.15);
  const [start, setStart] = useState(4);
  const [history, setHistory] = useState([4]);
  const [playing, setPlaying] = useState(false);

  const current = history[history.length - 1];

  const loss = (x: number) => x * x;
  const gradient = (x: number) => 2 * x;

  function step() {
    setHistory(previous => {
      const x = previous[previous.length - 1];

      if (Math.abs(x) > 1000 || previous.length >= 200) {
        return previous;
      }

      return [...previous, x - lr * gradient(x)];
    });
  }

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(step, 400);
    return () => clearInterval(timer);
  }, [playing, lr]);

  useEffect(() => {
    if (Math.abs(current) > 1000 ||
        Math.abs(current) < 0.0001 ||
        history.length >= 200) {
      setPlaying(false);
    }
  }, [current, history.length]);

  useEffect(() => {
    if (!chart.current) return;

    const limit = Math.max(
      5, ...history.map(x => Math.abs(x))
    );

    const xs = Array.from(
      { length: 200 },
      (_, i) => -limit + i * 2 * limit / 199
    );

    Plotly.react(chart.current, [
      {
        x: xs,
        y: xs.map(loss),
        type: "scatter",
        mode: "lines",
        name: "Loss function",
        line: { color: "#8b5cf6", width: 3 }
      },
      {
        x: history,
        y: history.map(loss),
        type: "scatter",
        mode: "lines+markers",
        name: "Optimization trajectory",
        line: { color: "#f59e0b", dash: "dash" },
        marker: { size: 7 }
      },
      {
        x: [current],
        y: [loss(current)],
        type: "scatter",
        mode: "markers",
        name: "Current position",
        marker: { color: "#ef4444", size: 16 }
      }
    ], {
      title: { text: "Gradient Descent Optimization" },
      height: 420,
      xaxis: { title: { text: "Parameter X" } },
      yaxis: { title: { text: "Loss" } },
      legend: { orientation: "h", y: -0.2 },
      margin: { l: 55, r: 20, t: 50, b: 90 }
    }, {
      responsive: true,
      displaylogo: false
    });
  }, [history]);

  useEffect(() => {
    const element = chart.current;
    return () => { if (element) Plotly.purge(element); };
  }, []);

  return (
    <section>
      <h2>Gradient Descent Playground</h2>

      <p>Iteration: <b>{history.length - 1}</b></p>
      <p>Parameter: <b>{current.toFixed(5)}</b></p>
      <p>Loss: <b>{loss(current).toFixed(5)}</b></p>
      <p>Gradient: <b>{gradient(current).toFixed(5)}</b></p>

      <div ref={chart} />

      <label>Learning Rate: {lr.toFixed(2)}</label>
      <input type="range" min="0.01" max="1.2" step="0.01"
        value={lr}
        onChange={e => setLr(Number(e.target.value))}
        style={{ width: "100%" }} />

      <label>Starting Position: {start.toFixed(2)}</label>
      <input type="range" min="-5" max="5" step="0.1"
        value={start}
        onChange={e => {
          const value = Number(e.target.value);
          setPlaying(false);
          setStart(value);
          setHistory([value]);
        }}
        style={{ width: "100%" }} />

      <button onClick={step}>Next Iteration</button>
      {" "}
      <button onClick={() => setPlaying(p => !p)}>
        {playing ? "Pause" : "Play"}
      </button>
      {" "}
      <button onClick={() => {
        setPlaying(false);
        setHistory([start]);
      }}>
        Reset
      </button>

      <h3>Experiment Observation</h3>

      <p>
        {lr > 1
          ? "Learning rate is too high. The optimizer may diverge."
          : lr === 1
          ? "The optimizer oscillates without reducing loss."
          : lr > 0.5
          ? "The optimizer oscillates while approaching the minimum."
          : "The optimizer moves toward the minimum."}
      </p>
    </section>
  );
}
