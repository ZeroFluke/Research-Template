let itiInstance = null;

document.addEventListener("DOMContentLoaded", async function () {
  const { data } = await zfSupabase.auth.getSession();
  if (data.session) {
    window.location.href = "dashboard.html";
    return;
  }

  const phoneInput = document.getElementById("su-phone");
  itiInstance = window.intlTelInput(phoneInput, {
    initialCountry: "auto",
    geoIpLookup: function (callback) {
      fetch("https://ipapi.co/json")
        .then((res) => res.json())
        .then((data) => callback(data.country_code || "ng"))
        .catch(() => callback("ng"));
    },
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23/build/js/utils.js"
  });
});

function showStatus(message, type) {
  const box = document.getElementById("statusBox");
  box.textContent = message;
  box.className = "status-box show status-" + type;
}

function clearStatus() {
  const box = document.getElementById("statusBox");
  box.className = "status-box";
}

document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  clearStatus();

  try {
    await handleSignupSubmit();
  } catch (err) {
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
    showStatus("Something went wrong: " + err.message + ". Please try again.", "error");
    console.error(err);
  }
});

async function handleSignupSubmit() {
  const fullName = document.getElementById("su-name").value.trim();
  const email = document.getElementById("su-email").value.trim();
  const password = document.getElementById("su-password").value;
  const passwordConfirm = document.getElementById("su-password-confirm").value;
  const phoneErrorHint = document.getElementById("phoneErrorHint");

  if (!itiInstance.isValidNumber()) {
    phoneErrorHint.style.display = "block";
    return;
  }
  phoneErrorHint.style.display = "none";

  const phone = itiInstance.getNumber();
  const country = itiInstance.getSelectedCountryData().iso2.toUpperCase();

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    showStatus("Password must be at least 8 characters, with a letter and a number.", "error");
    return;
  }

  if (password !== passwordConfirm) {
    showStatus("Passwords do not match.", "error");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  const { data, error } = await zfSupabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        country: country
      }
    }
  });

  submitBtn.disabled = false;
  submitBtn.textContent = "Create Account";

  if (error) {
    showStatus(error.message, "error");
    return;
  }

  showStatus("Account created. Please check your email to verify.", "success");
  document.getElementById("signupForm").reset();
}

document.getElementById("googleSignupBtn").addEventListener("click", async function () {
  const { error } = await zfSupabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/dashboard.html"
    }
  });

  if (error) {
    showStatus(error.message, "error");
  }
});
