import { useState } from "react";
import { api } from "../utils/api";

function LoginPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = mode === "login"
        ? await api.login({ id, password })
        : await api.signup({ id, name, password });
      onAuthSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>SDG 12 Sustainability Simulator</h1>
          <p className="subtext">Responsible Consumption & Production — Learn sustainability through play.</p>
        </div>

        <div className="auth-switch">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Sign In</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">Create Account</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            User ID
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Enter user ID" required />
          </label>
          {mode === "signup" && (
            <label>
              Display Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Choose a display name" required />
            </label>
          )}
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter password" required />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="demo-info">
          <h3>Demo Accounts</h3>
          <p className="subtext">Use these credentials to try different game states:</p>
          <ul className="demo-list">
            <li><strong>ADMIN-001</strong> / admin123 — All levels unlocked, full progress</li>
            <li><strong>PLAYER-001</strong> / player123 — Fresh start, no progress</li>
            <li><strong>PLAYER-025</strong> / player123 — Day 25 into Household level</li>
            <li><strong>PLAYER-050</strong> / player123 — Household completed</li>
            <li><strong>PLAYER-CITY</strong> / player123 — City level in progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
