// Frontend validation and form submission logic
// Comments are in English for clarity

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setText(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearLoginErrors() {
  setText('loginEmailError', '');
  setText('loginPasswordError', '');
  setText('loginMessage', '');
}

function clearRegisterErrors() {
  setText('regUsernameError', '');
  setText('regEmailError', '');
  setText('regPasswordError', '');
  setText('registerMessage', '');
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

// Login handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearLoginErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    let valid = true;
    if (!email) { setText('loginEmailError', 'Email is required'); valid = false; }
    else if (!emailRegex.test(email)) { setText('loginEmailError', 'Enter a valid email'); valid = false; }

    if (!password) { setText('loginPasswordError', 'Password is required'); valid = false; }
    else if (password.length < 6) { setText('loginPasswordError', 'Minimum 6 characters'); valid = false; }

    if (!valid) return;

    const { ok, json } = await postJSON('/api/login', { email, password });

    if (ok) {
      window.location.href = '/welcome.html';
    } else {
      setText('loginMessage', json.message || 'Invalid credentials');
    }
  });
}

// Register handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearRegisterErrors();

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    let valid = true;
    if (!username) { setText('regUsernameError', 'Username is required'); valid = false; }

    if (!email) { setText('regEmailError', 'Email is required'); valid = false; }
    else if (!emailRegex.test(email)) { setText('regEmailError', 'Enter a valid email'); valid = false; }

    if (!password) { setText('regPasswordError', 'Password is required'); valid = false; }
    else if (password.length < 6) { setText('regPasswordError', 'Minimum 6 characters'); valid = false; }

    if (!valid) return;

    const { ok, json } = await postJSON('/api/register', { username, email, password });

    if (ok) {
      setText('registerMessage', 'Account created! You can now log in.');
      registerForm.reset();
    } else {
      setText('registerMessage', json.message || 'Registration failed');
    }
  });
}

