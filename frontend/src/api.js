const API_BASE = "http://127.0.0.1:8000";
function getToken() {
    return localStorage.getItem("phishguard_token");
}

export function setToken(token) {
    localStorage.setItem("phishguard_token", token);
}

export function loadToken() {
    return localStorage.getItem("phishguard_token");
}

export function clearToken() {
    localStorage.removeItem("phishguard_token");
}
async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function registerUser(name, email, password, department) {
  return request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, department }),
  });
}

export async function loginUser(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const res = await fetch(`${API_BASE}/auth/login`, { method: "POST", body });
  if (!res.ok) throw new Error("Login failed — check your email and password");
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function scanEmail(rawEmail) {
  return request("/emails/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_email: rawEmail }),
  });
}

export async function getMySubmissions() {
  return request("/emails/my-submissions");
}

export async function getAllSubmissions() {
  return request("/emails/all");
}

export async function getStats() {
  return request("/emails/stats");
}

export async function getScenarios() {
  return request("/training/scenarios");
}

export async function submitAnswer(scenarioId, userAnswer) {
  return request("/training/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_id: scenarioId, user_answer: userAnswer }),
  });
}
