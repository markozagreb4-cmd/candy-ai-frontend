const API = "https://candy-ai-backend-hgft.onrender.com/chat";

// 🔌 STATE
let supabase;
let user = null;
let persona = "mia";
let isPro = false;

// 🚀 BOOT
window.addEventListener("load", async () => {
  try {
    console.log("BOOT START");

    if (!window.supabase) {
      document.body.innerHTML = "❌ Supabase SDK not loaded";
      return;
    }

    supabase = window.supabase.createClient(
      "https://zianilmlyzugxnbefcqs.supabase.co",
      "TVOJ_ANON_KEY"
    );

    let user = null;

    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch (e) {
      console.log("AUTH FAIL", e);
    }

    if (!user) {
      showLogin();
    } else {
      initApp();
    }

  } catch (err) {
    console.log("BOOT CRASH:", err);
    document.body.innerHTML = "❌ ERROR - CHECK CONSOLE";
  }
});
// 🔐 LOGIN
function showLogin() {
  document.body.innerHTML = `
    <div style="color:white;background:#0b0618;height:100vh;display:flex;justify-content:center;align-items:center;font-family:Arial;">
      <div style="width:300px;text-align:center;">
        <h2>💖 Candy AI Login</h2>

        <input id="email" placeholder="Email" style="width:100%;padding:10px;">
        <input id="password" type="password" placeholder="Password" style="width:100%;padding:10px;margin-top:10px;">

        <button id="loginBtn" style="width:100%;padding:10px;margin-top:10px;background:#ff3ea5;color:white;">
          Login / Sign up
        </button>
      </div>
    </div>
  `;

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let { data } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!data?.user) {
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

// 🚀 APP
async function initApp() {

  const { data } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  isPro = data?.is_pro || false;

  document.body.innerHTML = `
    <div style="background:#0b0618;color:white;height:100vh;display:flex;justify-content:center;align-items:center;font-family:Arial;">
      <div style="width:420px;display:flex;flex-direction:column;">

        <h2 style="text-align:center;">💖 Candy AI</h2>

        <div style="text-align:center;margin-bottom:10px;">
          👤 ${user.email}
        </div>

        <div style="text-align:center;margin-bottom:10px;">
          ${isPro ? "💎 PRO USER" : "FREE USER"}
        </div>

        <button id="proBtn" style="padding:10px;margin-bottom:10px;background:gold;border:none;">
          Upgrade to Pro
        </button>

        <div style="display:flex;gap:10px;justify-content:center;margin-bottom:10px;">
          <button id="miaBtn">Mia</button>
          <button id="annaBtn">Anna</button>
          <button id="saraBtn">Sara</button>
        </div>

        <div id="box" style="height:400px;overflow:auto;background:#111;padding:10px;"></div>

        <div style="display:flex;gap:10px;">
          <input id="input" style="flex:1;padding:10px;">
          <button id="send">Send</button>
        </div>

      </div>
    </div>
  `;

  const box = document.getElementById("box");
  const input = document.getElementById("input");

  function add(text, type) {
    const div = document.createElement("div");
    div.style.margin = "6px 0";
    div.style.padding = "10px";
    div.style.borderRadius = "8px";

    if (type === "user") {
      div.style.background = "#ff3ea5";
      div.innerText = "You: " + text;
    } else {
      div.style.background = "#1c1338";
      div.innerText = "AI: " + text;
    }

    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  document.getElementById("send").onclick = async () => {
    const text = input.value.trim();
    if (!text) return;

    add(text, "user");
    input.value = "";

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
  };

  document.getElementById("miaBtn").onclick = () => persona = "mia";
  document.getElementById("annaBtn").onclick = () => persona = "anna";
  document.getElementById("saraBtn").onclick = () => persona = "sara";

  document.getElementById("proBtn").onclick = async () => {
    const res = await fetch(API.replace("/chat", "/create-checkout"), {
      method: "POST"
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };
}
