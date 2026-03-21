import { useState } from "react";
import { api } from "../utils/api";

function LoginPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(newMode) {
    setMode(newMode);
    setId("");
    setName("");
    setPassword("");
    setError("");
  }

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
          <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">Sign In</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")} type="button">Create Account</button>
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
      </div>
    </div>
  );
}

export default LoginPage;
