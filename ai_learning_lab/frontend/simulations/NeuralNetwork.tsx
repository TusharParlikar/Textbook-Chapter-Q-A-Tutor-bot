
import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import Plotly from "plotly.js-dist-min";

type Activation = "relu" | "sigmoid" | "tanh";
type Dataset = "xor" | "circle" | "linear";
type Point = { x: number; y: number; label: number };

function generateData(type: Dataset): Point[] {
  return Array.from({ length: 200 }, (_, i) => {
    const x = Math.sin(i * 12.9898) * 2;
    const y = Math.cos(i * 78.233) * 2;

    let label = 0;

    if (type === "xor") {
      label = x * y > 0 ? 1 : 0;
    } else if (type === "circle") {
      label = x * x + y * y < 1.8 ? 1 : 0;
    } else {
      label = x + y > 0 ? 1 : 0;
    }

    return { x, y, label };
  });
}

type Network = {
  weights: tf.Variable[];
  biases: tf.Variable[];
  optimizer: tf.Optimizer;
  xs: tf.Tensor2D;
  ys: tf.Tensor2D;
};

function forward(
  input: tf.Tensor2D,
  network: Network,
  activation: Activation
) {
  let output: tf.Tensor = input;

  network.weights.forEach((weight, i) => {
    output = output.matMul(weight).add(network.biases[i]);

    if (i === network.weights.length - 1) {
      output = tf.sigmoid(output);
    } else if (activation === "relu") {
      output = tf.relu(output);
    } else if (activation === "tanh") {
      output = tf.tanh(output);
    } else {
      output = tf.sigmoid(output);
    }
  });

  return output;
}

export default function NeuralNetwork() {
  const chartRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  const [layers, setLayers] = useState([4, 4]);
  const [activation, setActivation] =
    useState<Activation>("tanh");

  const [dataset, setDataset] =
    useState<Dataset>("xor");

  const [lr, setLr] = useState(0.03);
  const [playing, setPlaying] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [version, setVersion] = useState(0);

  const [learnedWeights, setLearnedWeights] =
    useState<number[][][]>([]);

  const points = generateData(dataset);
  const architecture = [2, ...layers, 1];

  function getLoss(network: Network) {
    const prediction = forward(
      network.xs, network, activation
    );

    const p = prediction.clipByValue(1e-7, 1 - 1e-7);

    return tf.neg(
      network.ys.mul(p.log()).add(
        tf.scalar(1).sub(network.ys).mul(
          tf.scalar(1).sub(p).log()
        )
      )
    ).mean() as tf.Scalar;
  }

  function refreshVisualization(network: Network) {
    const grid = Array.from(
      { length: 41 },
      (_, i) => -2.2 + i * 4.4 / 40
    );

    const result = tf.tidy(() => {
      const prediction = forward(
        network.xs, network, activation
      );

      const correct = prediction.greaterEqual(0.5)
        .cast("float32")
        .equal(network.ys)
        .cast("float32")
        .mean()
        .dataSync()[0];

      const gridInput = tf.tensor2d(
        grid.flatMap(y => grid.map(x => [x, y]))
      );

      const probabilities = Array.from(
        forward(gridInput, network, activation).dataSync()
      );

      return {
        accuracy: correct,
        loss: getLoss(network).dataSync()[0],
        probabilities
      };
    });

    setAccuracy(result.accuracy * 100);
    setLoss(result.loss);

    setLearnedWeights(
      network.weights.map(
        w => w.arraySync() as number[][]
      )
    );

    const element = chartRef.current;
    if (!element) return;

    Plotly.react(element, [
      {
        x: grid,
        y: grid,
        z: grid.map((_, i) =>
          result.probabilities.slice(i * 41, (i + 1) * 41)
        ),
        type: "heatmap",
        colorscale: [
          [0, "#93c5fd"],
          [0.5, "#ffffff"],
          [1, "#fca5a5"]
        ],
        zmin: 0,
        zmax: 1,
        showscale: false
      },
      {
        x: points.filter(p => p.label === 0).map(p => p.x),
        y: points.filter(p => p.label === 0).map(p => p.y),
        type: "scatter",
        mode: "markers",
        name: "Class A",
        marker: { color: "#2563eb", size: 7 }
      },
      {
        x: points.filter(p => p.label === 1).map(p => p.x),
        y: points.filter(p => p.label === 1).map(p => p.y),
        type: "scatter",
        mode: "markers",
        name: "Class B",
        marker: { color: "#dc2626", size: 7 }
      }
    ], {
      title: { text: "Live Decision Boundary" },
      height: 370,
      xaxis: { range: [-2.2, 2.2] },
      yaxis: { range: [-2.2, 2.2] },
      margin: { l: 40, r: 15, t: 50, b: 50 },
      legend: { orientation: "h" }
    }, {
      responsive: true,
      displaylogo: false
    });
  }

  // Initialize or rebuild the network.
  useEffect(() => {
    setPlaying(false);
    setEpoch(0);

    const weights = architecture.slice(1).map(
      (size, i) => tf.tidy(() =>
        tf.variable(
          tf.randomNormal(
            [architecture[i], size],
            0,
            Math.sqrt(1 / architecture[i])
          )
        )
      )
    );

    const biases = architecture.slice(1).map(
      size => tf.tidy(() =>
        tf.variable(tf.zeros([size]))
      )
    );

    const network: Network = {
      weights,
      biases,
      optimizer: tf.train.adam(lr),
      xs: tf.tensor2d(points.map(p => [p.x, p.y])),
      ys: tf.tensor2d(points.map(p => [p.label]))
    };

    networkRef.current = network;
    refreshVisualization(network);

    return () => {
      network.optimizer.dispose();
      network.weights.forEach(w => w.dispose());
      network.biases.forEach(b => b.dispose());
      network.xs.dispose();
      network.ys.dispose();
      networkRef.current = null;
    };
  }, [layers, activation, dataset, lr, version]);

  function train(steps: number) {
    const network = networkRef.current;
    if (!network) return;

    for (let i = 0; i < steps; i++) {
      network.optimizer.minimize(
        () => getLoss(network),
        false,
        [...network.weights, ...network.biases]
      );
    }

    setEpoch(e => e + steps);
    refreshVisualization(network);
  }

  // Automatic training.
  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => train(5), 300);

    return () => clearInterval(timer);
  }, [playing, layers, activation, dataset, lr, version]);

  useEffect(() => {
    const element = chartRef.current;

    return () => {
      if (element) Plotly.purge(element);
    };
  }, []);

  function nodeX(layer: number) {
    return 45 + layer * 410 / (architecture.length - 1);
  }

  function nodeY(layer: number, neuron: number) {
    return 120 +
      (neuron - (architecture[layer] - 1) / 2) * 27;
  }

  return (
    <section>
      <h2>Neural Network Playground</h2>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        background: "#f1f5f9",
        padding: 15,
        borderRadius: 12
      }}>
        <div>
          Epoch
          <h3>{epoch}</h3>
        </div>

        <div>
          Loss
          <h3>{loss.toFixed(4)}</h3>
        </div>

        <div>
          Training Accuracy
          <h3>{accuracy.toFixed(1)}%</h3>
        </div>
      </div>

      <h3>Network Architecture</h3>

      <svg viewBox="0 0 500 250"
        style={{
          width: "100%",
          background: "#f8fafc",
          borderRadius: 12
        }}>

        {architecture.slice(0, -1).map((size, l) =>
          Array.from({ length: size }, (_, i) =>
            Array.from(
              { length: architecture[l + 1] },
              (_, j) => {
                const w = learnedWeights[l]?.[i]?.[j] ?? 0;

                return (
                  <line
                    key={`${l}-${i}-${j}`}
                    x1={nodeX(l)}
                    y1={nodeY(l, i)}
                    x2={nodeX(l + 1)}
                    y2={nodeY(l + 1, j)}
                    stroke={w >= 0 ? "#2563eb" : "#ef4444"}
                    strokeWidth={Math.min(5, 0.5 + Math.abs(w))}
                    opacity={0.65}
                  />
                );
              }
            )
          )
        )}

        {architecture.map((size, l) =>
          Array.from({ length: size }, (_, i) => (
            <circle
              key={`${l}-${i}`}
              cx={nodeX(l)}
              cy={nodeY(l, i)}
              r="10"
              fill={
                l === 0 ? "#10b981" :
                l === architecture.length - 1
                  ? "#f59e0b" : "#8b5cf6"
              }
              stroke="white"
              strokeWidth="2"
            />
          ))
        )}

        {architecture.map((size, l) => (
          <text
            key={l}
            x={nodeX(l)}
            y="238"
            textAnchor="middle"
            fontSize="11"
          >
            {l === 0 ? "Input" :
              l === architecture.length - 1
                ? "Output" : `Hidden ${l}`}
            {` (${size})`}
          </text>
        ))}
      </svg>

      <p style={{ fontSize: 12 }}>
        Blue connections represent positive weights.
        Red connections represent negative weights.
        Thickness indicates weight magnitude.
      </p>

      <div ref={chartRef} />

      <h3>Network Configuration</h3>

      <label>Dataset: </label>
      <select value={dataset}
        onChange={e => setDataset(e.target.value as Dataset)}>
        <option value="xor">XOR</option>
        <option value="circle">Circle</option>
        <option value="linear">Linear</option>
      </select>

      <p>Activation Function</p>

      <select value={activation}
        onChange={e =>
          setActivation(e.target.value as Activation)
        }>
        <option value="relu">ReLU</option>
        <option value="sigmoid">Sigmoid</option>
        <option value="tanh">Tanh</option>
      </select>

      <p>Learning Rate: {lr.toFixed(3)}</p>

      <input
        type="range"
        min="0.001"
        max="0.1"
        step="0.001"
        value={lr}
        onChange={e => setLr(Number(e.target.value))}
        style={{ width: "100%" }}
      />

      <h3>Hidden Layers</h3>

      {layers.map((size, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <label>Layer {i + 1}: {size} neurons</label>

          <input
            type="range"
            min="1"
            max="8"
            value={size}
            onChange={e => {
              setLayers(previous =>
                previous.map((n, j) =>
                  i === j ? Number(e.target.value) : n
                )
              );
            }}
            style={{ width: "100%" }}
          />
        </div>
      ))}

      <button
        disabled={layers.length >= 4}
        onClick={() => setLayers(l => [...l, 4])}
      >
        Add Layer
      </button>

      {" "}

      <button
        disabled={layers.length <= 1}
        onClick={() => setLayers(l => l.slice(0, -1))}
      >
        Remove Layer
      </button>

      <h3>Training Controls</h3>

      <button onClick={() => setPlaying(p => !p)}>
        {playing ? "Pause Training" : "Start Training"}
      </button>

      {" "}

      <button disabled={playing}
        onClick={() => train(10)}>
        Train 10 Epochs
      </button>

      {" "}

      <button onClick={() => {
        setPlaying(false);
        setVersion(v => v + 1);
      }}>
        Reset Network
      </button>
    </section>
  );
}
