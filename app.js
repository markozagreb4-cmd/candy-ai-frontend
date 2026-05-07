const SUPABASE_URL = "https://zianilmlyzugxnbefcqs.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYW5pbG1seXp1Z3huYmVmY3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzE4ODEsImV4cCI6MjA5MzU0Nzg4MX0.Wz6y8h5uT_00jWn5unydt4XBbPrY68gKmUqCwl390b8";

const API = "https://candy-ai-backend-hgft.onrender.com";

let supabase;

// FREE LIMIT
let msgCount = 0;

// INIT
window.addEventListener("load", async () => {

  if (!window.supabase) {
    document.body.innerHTML = "❌ Supabase not loaded";
    return;
  }

  supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

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
    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      background:#0b0618;
      color:white;
      font-family:Arial;
    ">
      <div style="
        background:#151020;
        padding:30px;
        border-radius:14px;
        width:300px;
      ">
        <h2 style="margin-top:0;">Candy AI 💖</h2>

        <input 
          id="email" 
          placeholder="Email"
          style="
            width:100%;
            padding:12px;
            margin-bottom:10px;
            border:none;
            border-radius:8px;
          "
        >

        <input 
          id="pass" 
          type="password" 
          placeholder="Password"
          style="
            width:100%;
            padding:12px;
            margin-bottom:15px;
            border:none;
            border-radius:8px;
          "
        >

        <button 
          id="btn"
          style="
            width:100%;
            padding:12px;
            background:#6a5cff;
            color:white;
            border:none;
            border-radius:8px;
            cursor:pointer;
          "
        >
          Login / Register
        </button>
      </div>
    </div>
  `;

  document.getElementById("btn").onclick = async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    let { data } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (!data?.user) {

      const res = await supabase.auth.signUp({
        email,
        password
      });

      data = res.data;
    }

    if (data?.user) {
      location.reload();
    }
  };
}


// 🚀 APP
async function showApp(user) {

  localStorage.setItem("userId", user.id);

  // CREATE PROFILE
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
    <div style="
      display:flex;
      flex-direction:column;
      height:100vh;
      background:#0b0618;
      color:white;
      font-family:Arial;
    ">

      <div style="
        padding:15px;
        border-bottom:1px solid #222;
        font-weight:bold;
      ">
        Candy AI 💖
      </div>

      <div 
        id="chat"
        style="
          flex:1;
          overflow-y:auto;
          padding:20px;
          display:flex;
          flex-direction:column;
        "
      ></div>

      <div 
        id="upgrade"
        style="
          background:#ff4d6d;
          padding:12px;
          text-align:center;
          cursor:pointer;
          font-weight:bold;
        "
      >
        💎 Upgrade to PRO
      </div>

      <div style="
        display:flex;
        padding:10px;
        border-top:1px solid #222;
        background:#120d20;
      ">

        <input
          id="msg"
          placeholder="Type a message..."
          style="
            flex:1;
            padding:12px;
            border:none;
            border-radius:10px;
            outline:none;
          "
        >

        <button
          id="send"
          style="
            margin-left:10px;
            padding:12px 20px;
            background:#6a5cff;
            color:white;
            border:none;
            border-radius:10px;
            cursor:pointer;
          "
        >
          Send
        </button>

      </div>
    </div>
  `;

  const chat = document.getElementById("chat");

  // MESSAGE UI
  function addMessage(text, type) {

    const div = document.createElement("div");

    div.style.marginBottom = "12px";
    div.style.maxWidth = "75%";
    div.style.padding = "12px";
    div.style.borderRadius = "12px";
    div.style.wordWrap = "break-word";

    if (type === "user") {
      div.style.background = "#6a5cff";
      div.style.alignSelf = "flex-end";
    } else {
      div.style.background = "#1e1b2e";
      div.style.alignSelf = "flex-start";
    }

    div.innerText = text;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;
  }

  // TYPING
  function showTyping() {

    const div = document.createElement("div");

    div.id = "typing";
    div.innerText = "Typing...";
    div.style.opacity = "0.7";
    div.style.marginBottom = "10px";

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;
  }

  function removeTyping() {

    const typing =
      document.getElementById("typing");

    if (typing) {
      typing.remove();
    }
  }

  // CHECK PRO
  async function checkPro() {
  try {
    const res = await fetch(`${API}/me?userId=${user.id}`);
    const data = await res.json();

    console.log("PRO CHECK:", data);

    localStorage.setItem("isPro", String(data.isPro));
  } catch (err) {
    console.log(err);
    localStorage.setItem("isPro", "false");
  }
}
  // SEND MESSAGE
  async function sendMessage() {

    const input =
      document.getElementById("msg");

    const message =
      input.value.trim();

    if (!message) return;

    addMessage(message, "user");

    input.value = "";

    const isPro =
      localStorage.getItem("isPro") === "true";

    // FREE LIMIT
   const isProBool = localStorage.getItem("isPro") === "true";

// FREE LIMIT
if (!isProBool && msgCount >= 5) {

  addMessage(
    "You reached the free limit 💎 Upgrade to continue.",
    "ai"
  );

  return;
}

// COUNT FREE MSG
if (!isProBool) {

  msgCount++;

  localStorage.setItem(
    "msgCount",
    String(msgCount)
  );
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

  addMessage(data.reply || "No response", "ai");

} catch (err) {

  removeTyping();

  addMessage("Server error", "ai");

  console.log(err);
}

  // SEND BUTTON
  document
    .getElementById("send")
    .onclick = sendMessage;

  // ENTER KEY
  document
    .getElementById("msg")
    .addEventListener("keydown", e => {

      if (e.key === "Enter") {
        sendMessage();
      }
    });

  // STRIPE
  document
    .getElementById("upgrade")
    .onclick = async () => {

      try {

        const res =
          await fetch(`${API}/create-checkout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId: user.id
            })
          });

        const data =
          await res.json();

        window.location.href =
          data.url;

      } catch (err) {

        alert("Stripe error");

        console.log(err);
      }
    };
}
