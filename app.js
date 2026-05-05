const API = "https://candy-ai-backend-hgft.onrender.com/chat";

document.body.innerHTML = `
  <div style="
    font-family: Arial;
    background:#0b0618;
    color:white;
    min-height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
  ">
    <div style="width:420px; display:flex; flex-direction:column;">

      <h2 style="text-align:center;">💖 Candy AI Chat</h2>

      <div id="box" style="
        flex:1;
        height:400px;
        overflow:auto;
        background:#111;
        padding:10px;
        border-radius:10px;
        margin-bottom:10px;
      "></div>

      <div style="display:flex; gap:10px;">
        <input id="input" style="flex:1; padding:10px;" placeholder="Type message...">
        <button id="send">Send</button>
      </div>

    </div>
  </div>
`;

const box = document.getElementById("box");
const input = document.getElementById("input");
const send = document.getElementById("send");

function add(text, type) {
  const div = document.createElement("div");
  div.style.margin = "6px 0";
  div.style.padding = "10px";
  div.style.borderRadius = "10px";
  div.style.maxWidth = "75%";

  if (type === "user") {
    div.style.background = "#ff3ea5";
    div.style.marginLeft = "auto";
    div.innerText = "You: " + text;
  } else {
    div.style.background = "#1c1338";
    div.innerText = "AI: " + text;
  }

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function sendMsg() {
  const text = input.value.trim();
  if (!text) return;

  add(text, "user");
  input.value = "";

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        persona: "mia"
      })
    });

    const data = await res.json();
    add(data.reply || "No response", "ai");

  } catch (err) {
    add("Error connecting to AI", "ai");
  }
}

send.onclick = sendMsg;

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMsg();
});
