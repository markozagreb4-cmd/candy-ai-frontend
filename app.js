const SUPABASE_URL = "https://zianilmlyzugxnbefcqs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYW5pbG1seXp1Z3huYmVmY3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzE4ODEsImV4cCI6MjA5MzU0Nzg4MX0.Wz6y8h5uT_00jWn5unydt4XBbPrY68gKmUqCwl390b8"; // 🔥 stavi svoj key
const API = "https://candy-ai-backend-hgft.onrender.com"; // 🔥 stavi backend URL

let supabase;

// INIT
window.addEventListener("load", async () => {

  if (!window.supabase) {
    document.body.innerHTML = "❌ Supabase not loaded";
    return;
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    showLogin();
  } else {
    showApp(user);
  }
});


// 🔐 LOGIN / REGISTER
function showLogin() {
  document.body.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0b0618;color:white;font-family:Arial;">
      <div>
        <h2>Login</h2>
        <input id="email" placeholder="email"><br><br>
        <input id="pass" type="password" placeholder="password"><br><br>
        <button id="btn">Login / Register</button>
      </div>
    </div>
  `;

  document.getElementById("btn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    let { data } = await supabase.auth.signInWithPassword({ email, password });

    if (!data?.user) {
      const res = await supabase.auth.signUp({ email, password });
      data = res.data;
    }

    if (data?.user) location.reload();
  };
}


// 🚀 MAIN APP
async function showApp(user) {

  localStorage.setItem("userId", user.id);

  // ✅ CREATE PROFILE (SAFE)
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify({
      id: user.id,
      is_pro: false
    })
  });

  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100vh;background:#0b0618;color:white;font-family:Arial;">
      
      <div id="chat" style="flex:1;padding:20px;overflow:auto;"></div>

      <div id="upgrade" style="background:#ff4d6d;padding:10px;text-align:center;cursor:pointer;">
        💎 Upgrade to PRO
      </div>

      <div style="display:flex;padding:10px;border-top:1px solid #222;">
        <input id="msg" placeholder="Type a message..." style="flex:1;padding:10px;border-radius:8px;border:none;">
        <button id="send" style="margin-left:10px;">Send</button>
      </div>
    </div>
  `;

  const chat = document.getElementById("chat");

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.style.marginBottom = "10px";
    div.style.maxWidth = "70%";
    div.style.padding = "10px";
    div.style.borderRadius = "10px";
    div.style.background = type === "user" ? "#6a5cff" : "#1e1b2e";
    div.innerText = text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.id = "typing";
    div.innerText = "Typing...";
    div.style.opacity = 0.6;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("typing");
    if (t) t.remove();
  }

  // 🔍 CHECK PRO
  async function checkPro() {
    const res = await fetch(`${API}/me?userId=${user.id}`);
    const data = await res.json();

    localStorage.setItem("isPro", data.isPro);
  }

  await checkPro();

  // 💬 SEND MESSAGE
  document.getElementById("send").onclick = async () => {
    const input = document.getElementById("msg");
    const message = input.value;

    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    const isPro = localStorage.getItem("isPro");

    if (!isPro || isPro === "false") {
      addMessage("Upgrade to PRO 💎", "ai");
      return;
    }

    showTyping();

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          persona: "mia",
          userId: user.id
        })
      });

      const data = await res.json();

      removeTyping();
      addMessage(data.reply, "ai");

    } catch (err) {
      removeTyping();
      addMessage("Error connecting to AI", "ai");
    }
  };

  // 💳 STRIPE
  document.getElementById("upgrade").onclick = async () => {
    const res = await fetch(`${API}/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId: user.id })
    });

    const data = await res.json();
    window.location.href = data.url;
  };
}
