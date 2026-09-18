const userLabel = document.getElementById("user-label");
const claimsBox = document.getElementById("claims-box");
const logoutLink = document.getElementById("logout-link");

async function loadSession() {
  try {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    if (!response.ok) {
      window.location.href = "/";
      return;
    }
    const data = await response.json();
    userLabel.textContent = `Conectado como: ${data.username}`;
    claimsBox.textContent = JSON.stringify(data.claims, null, 2);
  } catch (err) {
    window.location.href = "/";
  }
}

logoutLink.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  window.location.href = "/";
});

loadSession();
