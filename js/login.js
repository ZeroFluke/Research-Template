function showStatus(message, type) {
  const box = document.getElementById("statusBox");
  box.textContent = message;
  box.className = "status-box show status-" + type;
}

function clearStatus() {
  const box = document.getElementById("statusBox");
  box.className = "status-box";
}

function goToDashboard(welcomeMessage) {
  showStatus(welcomeMessage, "success");
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 800);
}

document.addEventListener("DOMContentLoaded", async function () {
  const { data } = await zfSupabase.auth.getSession();
  if (data.session) {
    window.location.href = "dashboard.html";
  }
});

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  clearStatus();

  const email = document.getElementById("li-email").value.trim();
  const password = document.getElementById("li-password").value;
  const submitBtn = document.getElementById("loginSubmitBtn");

  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";

  const { data, error } = await zfSupabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  submitBtn.disabled = false;
  submitBtn.textContent = "Log In";

  if (error) {
    if (error.message === "Email not confirmed") {
      showStatus("Your account is not verified yet. Please check your email for the verification link.", "error");
    } else {
      showStatus("Incorrect email or password.", "error");
      document.getElementById("forgotPasswordLine").style.display = "block";
    }
    return;
  }

  goToDashboard("Welcome back. Redirecting...");
});

document.getElementById("googleLoginBtn").addEventListener("click", async function () {
  const { error } = await zfSupabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: zfBaseUrl() + "dashboard.html"
    }
  });

  if (error) {
    showStatus(error.message, "error");
  }
});
