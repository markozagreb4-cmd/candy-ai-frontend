// 💳 STRIPE (SAFE VERSION)
const proBtn = document.getElementById("proBtn");

if (proBtn) {
  proBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(API.replace("/chat", "/create-checkout"), {
        method: "POST"
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }

    } catch (err) {
      console.log("Stripe error:", err);
    }
  });
}
