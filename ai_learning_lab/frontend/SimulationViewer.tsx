
import { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";
import LinearRegression from "./simulations/LinearRegression";
import LogisticRegression from "./simulations/LogisticRegression";
import KMeans from "./simulations/KMeans";
import KNN from "./simulations/KNN";
import GradientDescent from "./simulations/GradientDescent";
import Overfitting from "./simulations/Overfitting";
import NeuralNetwork from "./simulations/NeuralNetwork";

type ChartTrace = {
  name: string;
  type: "scatter" | "bar";
  mode: "lines" | "markers" | "lines+markers";
  x: number[];
  y: number[];
};

type ChartConfig = {
  title: string;
  x_label: string;
  y_label: string;
  traces: ChartTrace[];
};

function DynamicChart({ config }: { config: ChartConfig }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    const colors = [
      "#2F7A63",
      "#7C9A3E",
      "#C99A2E",
      "#8A5A7E"
    ];

    const data = config.traces.map((trace, i) => ({
      ...trace,
      marker: {
        color: colors[i % colors.length],
        size: 9
      },
      line: {
        color: colors[i % colors.length],
        width: 3
      }
    }));

    Plotly.react(
      element,
      data,
      {
        title: { text: config.title },
        xaxis: {
          title: { text: config.x_label }
        },
        yaxis: {
          title: { text: config.y_label }
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
          family: "IBM Plex Sans, Segoe UI, sans-serif",
          color: "#4A524D"
        },
        autosize: true,
        height: 420,
        margin: {
          l: 65,
          r: 25,
          t: 65,
          b: 60
        }
      },
      {
        responsive: true,
        displaylogo: false,
        scrollZoom: true
      }
    );

    return () => {
      Plotly.purge(element);
    };
  }, [config]);

  return (
    <section>
      <h2>Interactive Visualization</h2>
      <div
        ref={chartRef}
        style={{ width: "100%", minWidth: 0 }}
      />
      <p style={{ color: "#8A8C82", fontSize: 13 }}>
        Hover to inspect values. Zoom, pan, or toggle
        data series using the graph controls.
      </p>
    </section>
  );
}

export default function SimulationViewer({
  type,
  parameters
}: {
  type: string;
  parameters: Record<string, unknown>;
}) {
  switch (type) {
    case "linear_regression":
      return <LinearRegression />;

    case "overfitting":
      return <Overfitting />;

    case "logistic_regression":
      return <LogisticRegression />;

    case "kmeans":
      return <KMeans />;

    case "knn":
      return <KNN />;

    case "gradient_descent":
      return <GradientDescent />;

    case "neural_network":
      return <NeuralNetwork />;

    case "plotly":
      return (
        <DynamicChart
          config={parameters as ChartConfig}
        />
      );

    default:
      return <p>No visualization for this concept.</p>;
  }
}
