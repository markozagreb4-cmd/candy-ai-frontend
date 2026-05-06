const SUPABASE_URL = "https://zianilmlyzugxnbefcqs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYW5pbG1seXp1Z3huYmVmY3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzE4ODEsImV4cCI6MjA5MzU0Nzg4MX0.Wz6y8h5uT_00jWn5unydt4XBbPrY68gKmUqCwl390b8"; // 👈 zamijeni

let supabase;

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

// 🔐 LOGIN
function showLogin() {
  document.body.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;">
      <div>
        <h2>Login</h2>
        <input id="email" placeholder="email"><br><br>
        <input id="pass" type="password" placeholder="password"><br><br>
        <button id="btn">Login</button>
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

// 🚀 APP
function showApp(user) {
  document.body.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;">
      <h2>✅ LOGGED IN: ${user.email}</h2>
    </div>
  `;
}
