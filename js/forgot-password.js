function showStatus(message, type) {
  const box = document.getElementById("statusBox");
  box.textContent = message;
  box.className = "status-box show status-" + type;
}

document.getElementById("forgotForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const email = document.getElementById("fp-email").value.trim();
  const btn = document.getElementById("forgotSubmitBtn");

  btn.disabled = true;
  btn.textContent = "Sending...";

  const { error } = await zfSupabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password.html"
  });

  btn.disabled = false;
  btn.textContent = "Send Reset Link";

  if (error) {
    showStatus(error.message, "error");
    return;
  }

  showStatus("Password reset instructions have been sent to your email.", "success");
  document.getElementById("forgotForm").reset();
});
