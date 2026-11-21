
const API_URL = "http://localhost:8001";

const titles = {
  home: "Dashboard",
  tutor: "AI Textbook Tutor",
  lab: "AI Learning Lab",
  coding: "Coding Arena",
};

let threadId =
  sessionStorage.getItem("neural_thread") || crypto.randomUUID();

sessionStorage.setItem("neural_thread", threadId);

const messages = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");

function openPage(page) {
  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === `${page}-view`);
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  document.getElementById("page-title").textContent = titles[page];
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    openPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", () => {
    openPage(button.dataset.open);
  });
});

function addMessage(role, text, sources = []) {
  const welcome = messages.querySelector(".welcome");
  if (welcome) welcome.remove();

  const container = document.createElement("div");
  container.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "U" : "✳";

  const content = document.createElement("div");
  content.className = "message-content";

  const heading = document.createElement("strong");
  heading.textContent = role === "user" ? "You" : "AI Tutor";

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = text;

  content.append(heading, body);

  if (sources.length) {
    const sourceBox = document.createElement("div");
    sourceBox.className = "sources";
    sourceBox.textContent = "Textbook sources";

    sources.forEach(source => {
      const item = document.createElement("div");
      item.className = "source";
      item.textContent =
        `[${source.id}] ${source.book} — PDF page ${source.page}`;
      sourceBox.appendChild(item);
    });

    content.appendChild(sourceBox);
  }

  container.append(avatar, content);
  messages.appendChild(container);
  messages.scrollTop = messages.scrollHeight;

  return body;
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const question = input.value.trim();
  if (!question || sendButton.disabled) return;

  addMessage("user", question);
  input.value = "";

  sendButton.disabled = true;
  const responseBody = addMessage("assistant", "Thinking...");

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        thread_id: threadId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chatbot API error: ${response.status}`);
    }

    const data = await response.json();

    responseBody.textContent = data.answer;

    if (data.sources?.length) {
      const sourceBox = document.createElement("div");
      sourceBox.className = "sources";
      sourceBox.textContent = "Textbook sources";

      data.sources.forEach(source => {
        const item = document.createElement("div");
        item.className = "source";
        item.textContent =
          `[${source.id}] ${source.book} — PDF page ${source.page}`;
        sourceBox.appendChild(item);
      });

      responseBody.parentElement.appendChild(sourceBox);
    }

  } catch (error) {
    responseBody.textContent =
      "Unable to reach the chatbot. Check that the API is running on port 8001.";
    console.error(error);
  } finally {
    sendButton.disabled = false;
    messages.scrollTop = messages.scrollHeight;
    input.focus();
  }
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.getElementById("new-chat").addEventListener("click", () => {
  threadId = crypto.randomUUID();
  sessionStorage.setItem("neural_thread", threadId);

  messages.replaceChildren();

  const welcome = document.createElement("div");
  welcome.className = "welcome";

  const icon = document.createElement("div");
  icon.className = "welcome-icon";
  icon.textContent = "✳";

  const heading = document.createElement("h2");
  heading.textContent = "New conversation";

  const description = document.createElement("p");
  description.textContent = "What would you like to learn today?";

  welcome.append(icon, heading, description);
  messages.appendChild(welcome);

  input.focus();
});
