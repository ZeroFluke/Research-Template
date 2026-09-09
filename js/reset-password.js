function showStatus(message, type) {
  const box = document.getElementById("statusBox");
  box.textContent = message;
  box.className = "status-box show status-" + type;
}

document.addEventListener("DOMContentLoaded", async function () {
  const { data } = await zfSupabase.auth.getSession();
  if (!data.session) {
    document.getElementById("resetForm").style.display = "none";
    showStatus("This link is invalid or has expired. Please request a new one from the Forgot Password page.", "error");
  }
});

document.getElementById("resetForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const password = document.getElementById("rp-password").value;
  const confirm = document.getElementById("rp-confirm").value;
  const btn = document.getElementById("resetSubmitBtn");

  if (password !== confirm) {
    showStatus("Passwords do not match.", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Updating...";

  const { error } = await zfSupabase.auth.updateUser({ password: password });

  btn.disabled = false;
  btn.textContent = "Update Password";

  if (error) {
    showStatus(error.message, "error");
    return;
  }

  showStatus("Password updated. Redirecting to log in...", "success");
  document.getElementById("resetForm").reset();
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
});
