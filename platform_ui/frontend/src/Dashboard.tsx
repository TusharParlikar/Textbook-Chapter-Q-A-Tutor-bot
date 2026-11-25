import problemsData from "../../../AIML_coding_platform/data/problems.json";
import type { Module } from "./App";
import { IconArrowRight } from "./icons";

const problems = problemsData as { difficulty: string }[];

const SIMULATIONS = [
  "Linear Regression",
  "Logistic Regression",
  "K-Means Clustering",
  "K-Nearest Neighbours",
  "Gradient Descent",
  "Overfitting",
  "Neural Networks",
];

const STARTER_QUESTIONS = [
  "What is retrieval-augmented generation?",
  "How does self-attention work in a transformer?",
  "Explain the bias–variance trade-off.",
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* Small hand-drawn illustrations for each module card. */

function ArtStudy() {
  return (
    <svg viewBox="0 0 160 84" className="card-art" aria-hidden="true">
      <rect x="18" y="10" width="124" height="66" rx="4" fill="var(--surface)" stroke="var(--rule-strong)" />
      <line x1="80" y1="10" x2="80" y2="76" stroke="var(--rule-strong)" />
      {[22, 30, 38, 46, 54, 62].map((y, i) => (
        <line key={y} x1="28" y1={y} x2={i === 3 ? 58 : 70} y2={y} stroke="var(--rule-strong)" strokeWidth="2" strokeLinecap="round" />
      ))}
      <rect x="27" y="35" width="44" height="7" rx="2" fill="var(--ochre-tint)" />
      <line x1="28" y1="38" x2="70" y2="38" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" />
      {[22, 30, 38].map(y => (
        <line key={y} x1="90" y1={y} x2="132" y2={y} stroke="var(--rule-strong)" strokeWidth="2" strokeLinecap="round" />
      ))}
      <path d="M90 52c8-4 14 4 22-1s10 2 18-2" stroke="var(--vermilion)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="38" r="3" fill="var(--vermilion)" />
    </svg>
  );
}

function ArtSimulate() {
  const pts = [[30, 58], [44, 50], [52, 54], [64, 42], [76, 40], [88, 33], [98, 36], [112, 24], [126, 22]];
  return (
    <svg viewBox="0 0 160 84" className="card-art" aria-hidden="true">
      <line x1="20" y1="72" x2="144" y2="72" stroke="var(--rule-strong)" />
      <line x1="20" y1="10" x2="20" y2="72" stroke="var(--rule-strong)" />
      <line x1="24" y1="62" x2="140" y2="18" stroke="var(--ochre)" strokeWidth="2.2" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={62 - (x - 24) * 0.379} stroke="var(--rule-strong)" strokeDasharray="2 2" />
          <circle cx={x} cy={y} r="3.2" fill="var(--pine)" />
        </g>
      ))}
    </svg>
  );
}

function ArtSolve() {
  return (
    <svg viewBox="0 0 160 84" className="card-art" aria-hidden="true">
      <rect x="18" y="10" width="124" height="66" rx="6" fill="#1b211e" />
      <circle cx="28" cy="19" r="2.2" fill="#c2462b" />
      <circle cx="36" cy="19" r="2.2" fill="#b8892c" />
      <circle cx="44" cy="19" r="2.2" fill="#4f8a72" />
      <rect x="28" y="30" width="22" height="4" rx="2" fill="#d9b25e" />
      <rect x="54" y="30" width="34" height="4" rx="2" fill="#ece6da" opacity=".7" />
      <rect x="36" y="40" width="40" height="4" rx="2" fill="#8dbfa9" />
      <rect x="36" y="50" width="28" height="4" rx="2" fill="#ece6da" opacity=".5" />
      <rect x="68" y="50" width="30" height="4" rx="2" fill="#e2775a" />
      <rect x="28" y="62" width="58" height="6" rx="3" fill="#2f7a4f" opacity=".35" />
      <text x="34" y="67" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="#9fd4b0">✓ 5/5 passed</text>
    </svg>
  );
}

type Props = {
  onOpen: (m: Module) => void;
  onAsk: (q: string) => void;
  onExplore: (topic: string) => void;
};

export default function Dashboard({ onOpen, onAsk, onExplore }: Props) {
  const easy = problems.filter(p => p.difficulty === "Easy").length;

  const modules = [
    {
      id: "chatbot" as const,
      n: "01",
      verb: "Study",
      title: "Textbook Tutor",
      body: "Ask in plain language. Answers are drawn only from your textbooks, with the page cited.",
      meta: "LangGraph · RAG · cited",
      tone: "pine",
      art: <ArtStudy />,
    },
    {
      id: "lab" as const,
      n: "02",
      verb: "Simulate",
      title: "Learning Lab",
      body: "Turn a concept into something you can move. Drag points, tune rates, watch models learn.",
      meta: `${SIMULATIONS.length} live simulations`,
      tone: "ochre",
      art: <ArtSimulate />,
    },
    {
      id: "coding" as const,
      n: "03",
      verb: "Solve",
      title: "Coding Arena",
      body: "Implement the maths yourself in Python, right in the browser, and grade it against tests.",
      meta: `${problems.length} problems · ${easy} easy`,
      tone: "vermilion",
      art: <ArtSolve />,
    },
  ];

  return (
    <div className="desk">
      <header className="desk-hero">
        <p className="kicker">{greeting()} · your study desk</p>
        <h1 className="desk-title">
          Read it. See it.{" "}
          <em className="annotated">Write it.</em>
        </h1>
        <p className="desk-lede">
          Margin brings your textbooks, interactive simulations and a Python
          practice arena into one quiet workspace — so a question can become
          an intuition, and an intuition can become working code.
        </p>
      </header>

      <section className="module-row" aria-label="Modules">
        {modules.map(m => (
          <button
            key={m.id}
            className={`module-card tone-${m.tone}`}
            onClick={() => onOpen(m.id)}
          >
            <div className="module-art">{m.art}</div>
            <div className="module-body">
              <div className="module-head">
                <span className="module-n">{m.n}</span>
                <span className="module-verb">{m.verb}</span>
              </div>
              <h2>{m.title}</h2>
              <p>{m.body}</p>
              <div className="module-foot">
                <span className="kicker">{m.meta}</span>
                <span className="module-go">
                  Open <IconArrowRight size={15} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </section>

      <section className="desk-columns">
        <div className="desk-panel">
          <div className="panel-head">
            <h3>Start with a question</h3>
            <span className="kicker">Tutor</span>
          </div>
          <ul className="prompt-list">
            {STARTER_QUESTIONS.map(q => (
              <li key={q}>
                <button onClick={() => onAsk(q)}>
                  <span>{q}</span>
                  <IconArrowRight size={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="desk-panel">
          <div className="panel-head">
            <h3>Or play with an idea</h3>
            <span className="kicker">Lab</span>
          </div>
          <div className="chip-cloud">
            {SIMULATIONS.map(s => (
              <button key={s} className="chip" onClick={() => onExplore(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="desk-foot">
        <span>Your books are indexed on your machine. Answers are written by a model on OpenRouter, using only the passages found in them.</span>
      </footer>
    </div>
  );
}
