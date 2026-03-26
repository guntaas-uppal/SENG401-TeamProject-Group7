const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  getDemoUsers: () => request("/auth/demo-users"),
  getSummary: (userId) => request(`/game/summary/${userId}`),
  getProgress: (userId, level) => request(`/game/progress/${userId}/${level}`),
  chooseOption: (payload) => request("/game/choose", { method: "POST", body: JSON.stringify(payload) }),
  resetLevel: (userId, level) => request(`/game/reset/${userId}/${level}`, { method: "POST" }),
  getLeaderboard: (level) => request(level ? `/game/leaderboard/${level}` : "/game/leaderboard"),
  getHistory: (userId, level) => request(`/game/history/${userId}/${level}`),
};
