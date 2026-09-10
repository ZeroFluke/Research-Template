const ZF_GOOGLE_CLIENT_ID = "305149507909-stpai58m35c6tmjjfr4cclgojjrau068.apps.googleusercontent.com";

async function zfSha256Hex(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function zfRandomNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function handleGoogleCredential(response) {
  const { error } = await zfSupabase.auth.signInWithIdToken({
    provider: "google",
    token: response.credential,
    nonce: window.zfGoogleRawNonce
  });

  if (error) {
    showStatus(error.message, "error");
    return;
  }

  goToDashboard("Welcome back. Redirecting...");
}

async function initGoogleButton() {
  const rawNonce = zfRandomNonce();
  window.zfGoogleRawNonce = rawNonce;
  const hashedNonce = await zfSha256Hex(rawNonce);

  google.accounts.id.initialize({
    client_id: ZF_GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    nonce: hashedNonce
  });

  google.accounts.id.renderButton(document.getElementById("googleBtnWrap"), {
    theme: "outline",
    size: "large",
    width: 320,
    text: "signin_with"
  });
}

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
    return;
  }

  initGoogleButton();
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
