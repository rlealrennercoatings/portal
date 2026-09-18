const form = document.getElementById("login-form");
const messageBox = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "Autenticando...";
  messageBox.className = "message";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok || data.ok === false) {
      showMessage(data.detail || "Falha na autenticação. Verifique usuário e senha.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Entrar";
      return;
    }

    showMessage("Autenticado com sucesso! Redirecionando...", "success");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  } catch (err) {
    showMessage("Não foi possível contatar o portal. Tente novamente.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Entrar";
  }
});
