
import { useState } from "react";
import LearningLab from "../../../ai_learning_lab/frontend/page";
import CodingArena from "../../../AIML_coding_platform/frontend/page";
import ChatbotPage from "./ChatbotPage";
import "./App.css";

type Module = "dashboard" | "chatbot" | "lab" | "coding";

export default function App() {
  const [active, setActive] = useState<Module>("dashboard");

  const navigation: { id: Module; title: string }[] = [
    { id: "dashboard", title: "Dashboard" },
    { id: "chatbot", title: "AI Textbook Tutor" },
    { id: "lab", title: "AI Learning Lab" },
    { id: "coding", title: "AI/ML Coding Arena" },
  ];

  return (
    <div className="platform">
      <aside className="sidebar">
        <h2>✦ AI Learning</h2>
        <p>One platform. Three ways to learn.</p>

        <nav>
          {navigation.map(item => (
            <button
              key={item.id}
              className={active === item.id ? "active" : ""}
              onClick={() => setActive(item.id)}
            >
              {item.title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <div style={{ display: active === "dashboard" ? "block" : "none" }}>
          <h1>AI Learning Platform</h1>
          <p>Choose a module to start learning.</p>

          <div className="module-grid">
            <button onClick={() => setActive("chatbot")}>
              <h2>AI Textbook Tutor</h2>
              <p>Ask questions from AI textbooks.</p>
            </button>

            <button onClick={() => setActive("lab")}>
              <h2>AI Learning Lab</h2>
              <p>Explore interactive AI/ML simulations.</p>
            </button>

            <button onClick={() => setActive("coding")}>
              <h2>Coding Arena</h2>
              <p>Solve AI/ML problems using Python.</p>
            </button>
          </div>
        </div>

        <div style={{ display: active === "chatbot" ? "block" : "none" }}>
          <ChatbotPage />
        </div>

        <div style={{ display: active === "lab" ? "block" : "none" }}>
          <LearningLab />
        </div>

        <div style={{ display: active === "coding" ? "block" : "none" }}>
          <CodingArena />
        </div>
      </main>
    </div>
  );
}
