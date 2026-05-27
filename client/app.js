const SERVER_URL = "http://localhost:4000";

const username = prompt("Choose a username:") || "Anonymous";
document.getElementById("username-display").textContent = `You are: ${username}`;

const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

const messagesEl = document.getElementById("messages");
const usersEl = document.getElementById("users");
const formEl = document.getElementById("message-form");
const inputEl = document.getElementById("message-input");

socket.on("connect", () => {
  socket.emit("join", username);
});

socket.on("chat_message", (payload) => {
  addMessage(payload.username, payload.message, payload.timestamp);
});

socket.on("system_message", (text) => {
  addSystemMessage(text);
});

socket.on("online_users", (users) => {
  usersEl.innerHTML = "";
  users.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = u;
    usersEl.appendChild(li);
  });
});

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  socket.emit("chat_message", text);
  inputEl.value = "";
});

function addMessage(username, text, timestamp) {
  const div = document.createElement("div");
  div.classList.add("message");

  const meta = document.createElement("div");
  meta.classList.add("meta");
  const time = new Date(timestamp).toLocaleTimeString();
  meta.textContent = `${username} • ${time}`;

  const body = document.createElement("div");
  body.classList.add("text");
  body.textContent = text;

  div.appendChild(meta);
  div.appendChild(body);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addSystemMessage(text) {
  const div = document.createElement("div");
  div.classList.add("message", "system");
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
