// Instagram Login Phishing Simulator
// Captures credentials client-side and stores them in localStorage

const STORAGE_KEY = 'insta_phish_captures';

// Elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const togglePasswordBtn = document.getElementById('toggle-password');
const loginScreen = document.getElementById('login-screen');
const resultScreen = document.getElementById('result-screen');
const capturedUsername = document.getElementById('captured-username');
const capturedPassword = document.getElementById('captured-password');
const capturedTime = document.getElementById('captured-time');
const capturedUa = document.getElementById('captured-ua');
const copyBtn = document.getElementById('copy-btn');
const resetBtn = document.getElementById('reset-btn');
const historyList = document.getElementById('history-list');
const historyCount = document.getElementById('history-count');

// Enable/disable login button based on inputs
function updateLoginButton() {
  const hasUser = usernameInput.value.trim().length > 0;
  const hasPass = passwordInput.value.length > 0;
  loginBtn.disabled = !(hasUser && hasPass);
}

usernameInput.addEventListener('input', updateLoginButton);
passwordInput.addEventListener('input', updateLoginButton);

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePasswordBtn.textContent = isPassword ? 'Hide' : 'Show';
});

// Get history from localStorage
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

// Save capture
function saveCapture(username, password) {
  const entry = {
    username,
    password,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    id: Date.now()
  };

  const history = getHistory();
  history.unshift(entry);
  // Keep last 50
  if (history.length > 50) history.length = 50;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

// Render history
function renderHistory() {
  const history = getHistory();
  historyCount.textContent = `(${history.length})`;

  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty">No previous captures</p>';
    return;
  }

  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <div><strong>${escapeHtml(item.username)}</strong> · ${escapeHtml(item.password)}</div>
      <div class="meta">${formatTime(item.timestamp)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// Handle form submit
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) return;

  // Capture
  const entry = saveCapture(username, password);

  // Show result
  capturedUsername.textContent = entry.username;
  capturedPassword.textContent = entry.password;
  capturedTime.textContent = formatTime(entry.timestamp);
  capturedUa.textContent = entry.userAgent;

  renderHistory();

  loginScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
});

// Copy all
copyBtn.addEventListener('click', async () => {
  const text = [
    `Username: ${capturedUsername.textContent}`,
    `Password: ${capturedPassword.textContent}`,
    `Time: ${capturedTime.textContent}`,
    `UA: ${capturedUa.textContent}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy All'; }, 1500);
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy All'; }, 1500);
  }
});

// Reset
resetBtn.addEventListener('click', () => {
  usernameInput.value = '';
  passwordInput.value = '';
  updateLoginButton();
  passwordInput.type = 'password';
  togglePasswordBtn.textContent = 'Show';

  resultScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  usernameInput.focus();
});

// Initial history render (in case page reloaded on result)
renderHistory();
