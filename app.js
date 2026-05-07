const isProBool = localStorage.getItem("isPro") === "true";
let msgCount = Number(localStorage.getItem("msgCount") || "0");

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

  const input = document.getElementById("msg");
  const message = input.value.trim();

  if (!message) return;

  addMessage(message, "user");
  input.value = "";

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
    localStorage.setItem("msgCount", String(msgCount));
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
}

// SEND BUTTON
document.getElementById("send").onclick = sendMessage;

// ENTER KEY
document.getElementById("msg").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
