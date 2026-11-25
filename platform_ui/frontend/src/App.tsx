import { useEffect, useState, type ReactNode } from "react";
import LearningLab from "../../../ai_learning_lab/frontend/page";
import CodingArena from "../../../AIML_coding_platform/frontend/page";
import ChatbotPage from "./ChatbotPage";
import Dashboard from "./Dashboard";
import { Logo } from "./brand/Logo";
import {
  IconBook,
  IconBrackets,
  IconDesk,
  IconMoon,
  IconSun,
  IconWave,
} from "./icons";
import "./App.css";

export type Module = "dashboard" | "chatbot" | "lab" | "coding";
export type Handoff = { text: string; nonce: number };

type NavItem = {
  id: Module;
  label: string;
  verb: string;
  icon: ReactNode;
  tone: "pine" | "ochre" | "vermilion" | "ink";
};

const NAV: NavItem[] = [
  { id: "dashboard", label: "Desk", verb: "Overview", icon: <IconDesk />, tone: "ink" },
  { id: "chatbot", label: "Textbook Tutor", verb: "Study", icon: <IconBook />, tone: "pine" },
  { id: "lab", label: "Learning Lab", verb: "Simulate", icon: <IconWave />, tone: "ochre" },
  { id: "coding", label: "Coding Arena", verb: "Solve", icon: <IconBrackets />, tone: "vermilion" },
];

type Theme = "light" | "dark";

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem("margin-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const HASH: Record<Module, string> = {
  dashboard: "",
  chatbot: "tutor",
  lab: "lab",
  coding: "arena",
};

function moduleFromHash(): Module {
  const h = window.location.hash.replace("#", "");
  const match = (Object.keys(HASH) as Module[]).find(m => HASH[m] === h);
  return match ?? "dashboard";
}

export default function App() {
  const [active, setActiveState] = useState<Module>(moduleFromHash);

  function setActive(m: Module) {
    setActiveState(m);
    const next = HASH[m] ? `#${HASH[m]}` : window.location.pathname;
    if (window.location.hash !== (HASH[m] ? `#${HASH[m]}` : "")) {
      history.pushState(null, "", next);
    }
    window.scrollTo({ top: 0 });
  }

  useEffect(() => {
    const sync = () => setActiveState(moduleFromHash());
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [tutorDraft, setTutorDraft] = useState<Handoff | null>(null);
  const [labQuery, setLabQuery] = useState<Handoff | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("margin-theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  function askTutor(text: string) {
    setTutorDraft({ text, nonce: Date.now() });
    setActive("chatbot");
  }

  function exploreInLab(text: string) {
    setLabQuery({ text, nonce: Date.now() });
    setActive("lab");
  }

  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-brand">
          <Logo />
        </div>

        <p className="kicker rail-label">Workspace</p>

        <nav className="rail-nav" aria-label="Modules">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`rail-item tone-${item.tone}${active === item.id ? " is-active" : ""}`}
              aria-current={active === item.id ? "page" : undefined}
              onClick={() => setActive(item.id)}
            >
              <span className="rail-icon">{item.icon}</span>
              <span className="rail-text">
                <span className="rail-title">{item.label}</span>
                <span className="rail-verb">{item.verb}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="rail-foot">
          <div className="status">
            <span className="status-dot" />
            <span>via OpenRouter</span>
          </div>

          <button
            className="theme-toggle"
            onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </aside>

      <main className={`stage stage-${active}`}>
        <div hidden={active !== "dashboard"}>
          <Dashboard
            onOpen={setActive}
            onAsk={askTutor}
            onExplore={exploreInLab}
          />
        </div>

        <div hidden={active !== "chatbot"}>
          <ChatbotPage draft={tutorDraft} />
        </div>

        <div hidden={active !== "lab"}>
          <LearningLab pendingQuery={labQuery} />
        </div>

        <div hidden={active !== "coding"}>
          <CodingArena />
        </div>
      </main>
    </div>
  );
}
