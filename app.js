const API = "https://candy-ai-backend-hgft.onrender.com/chat";

// 🔌 GLOBAL STATE
let supabase;
let user = null;
let persona = "mia";
let isPro = false;

console.log("APP START");

// 🚀 BOOT
window.addEventListener("load", async () => {
  try {
    console.log("BOOT START");

    if (!window.supabase) {
      document.body.innerHTML = "❌ Supabase not loaded";
      return;
    }

    // 🔑 INIT SUPABASE
    supabase = window.supabase.createClient(
      "https://zianilmlyzugxnbefcqs.supabase.co",
      "YOUR_ANON_KEY"
    );

    // 🔐 GET USER
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;

    if (!user) {
      showLogin();
    } else {
      initApp();
    }

  } catch (err) {
    console.log("BOOT ERROR:", err);
    document.body.innerHTML = "❌ App crashed (check console)";
  }
});


// 🔐 LOGIN UI
function showLogin() {
  document.body.innerHTML = `
    <div style="font-family:Arial;background:#0b0618;color:white;height:100vh;display:flex;justify-content:center;align-items:center;">
      <div style="width:300px;text-align:center;">
        <h2>💖 Candy AI Login</h2>

        <input id="email" placeholder="Email" style="width:100%;padding:10px;">
        <input id="password" type="password" placeholder="Password" style="width:100%;padding:10px;margin-top:10px;">

        <button id="loginBtn" style="width:100%;padding:10px;margin-top:10px;background:#ff3ea5;color:white;border:none;">
          Login / Sign up
        </button>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const res = await supabase.auth.signUp({ email, password });
      data = res.data;
    }

    const u = data?.user;

    if (u) {
      await supabase.from("profiles").upsert({
        id: u.id,
        email: u.email
      });
    }

    location.reload();
  };
}


// 🚀 MAIN APP
async function initApp() {

  document.body.innerHTML = "<h2 style='color:white;text-align:center;margin-top:50px;'>Loading...</h2>";

  // 💎 GET PRO STATUS
  const { data, error } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  if (error) {
    console.log("PROFILE ERROR:", error);
  }

  isPro = data?.is_pro || false;

  // 🧠 CHECK STRIPE RETURN
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("success")) {
    isPro = true;
  }

  // 🎨 UI
  document.body.innerHTML = `
    <div style="font-family:Arial;background:#0b0618;color:white;min-height:100vh;display:flex;justify-content:center;align-items:center;">
      <div style="width:420px;display:flex;flex-direction:column;">

        <h2 style="text-align:center;">💖 Candy AI Chat</h2>

        <div style="text-align:center;margin-bottom:10px;">
          👤 ${user.email}
        </div>

        <div id="status" style="text-align:center;margin-bottom:10px;">
          ${isPro ? "💎 PRO USER" : "FREE USER"}
        </div>

        ${!isPro ? `
        <button id="proBtn" style="width:100%;padding:10px;margin-bottom:10px;background:gold;border:none;">
          💎 Upgrade to Pro
        </button>
        ` : ""}

        <div style="display:flex;gap:10px;justify-content:center;margin-bottom:10px;">
          <button id="miaBtn">Mia 💖</button>
          <button id="annaBtn">Anna 😏</button>
          <button id="saraBtn">Sara 💭</button>
        </div>

        <div id="box" style="height:400px;overflow:auto;background:#111;padding:10px;border-radius:10px;margin-bottom:10px;"></div>

        <div style="display:flex;gap:10px;">
          <input id="input" style="flex:1;padding:10px;">
          <button id="send">Send</button>
        </div>

      </div>
    </div>
  `;

  const box = document.getElementById("box");
  const input = document.getElementById("input");
  const send = document.getElementById("send");

  const miaBtn = document.getElementById("miaBtn");
  const annaBtn = document.getElementById("annaBtn");
  const saraBtn = document.getElementById("saraBtn");
  const proBtn = document.getElementById("proBtn");

  function setActive(btn) {
    [miaBtn, annaBtn, saraBtn].forEach(b => {
      b.style.background = "";
      b.style.color = "black";
    });
    btn.style.background = "#ff3ea5";
    btn.style.color = "white";
  }

  setActive(miaBtn);

  miaBtn.onclick = () => { persona = "mia"; setActive(miaBtn); };
  annaBtn.onclick = () => { persona = "anna"; setActive(annaBtn); };
  saraBtn.onclick = () => { persona = "sara"; setActive(saraBtn); };

  // 💳 STRIPE
  if (proBtn) {
    proBtn.onclick = async () => {
      const res = await fetch(API.replace("/chat", "/create-checkout"), {
        method: "POST"
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
    };
  }

  // 💬 ADD MESSAGE
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

  // 🚀 SEND
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
          persona,
          userId: user.id
        })
      });

      const data = await res.json();
      add(data.reply || "no response", "ai");

    } catch (err) {
      add("error connecting", "ai");
    }
  }

  send.onclick = sendMsg;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMsg();
  });
}
