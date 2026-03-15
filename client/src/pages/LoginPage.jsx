import { useEffect, useState } from "react";
import { api } from "../utils/api";

function LoginPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [demoUsers, setDemoUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDemoUsers().then(setDemoUsers).catch(() => {});
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const result = await api.login({ id, password });
        onAuthSuccess(result.user);
      } else {
        const result = await api.signup({ id, name, password });
        onAuthSuccess(result.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemoUser(userId, demoPassword) {
    setId(userId);
    setPassword(demoPassword);
    setMode("login");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>SDG 12 Sustainability Simulator</h1>
        <p className="subtext">
          Log in with a demo account or sign up as a new player.
        </p>

        <div className="auth-switch">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            User ID
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter user ID"
              required
            />
          </label>

          {mode === "signup" && (
            <label>
              Display Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter display name"
                required
              />
            </label>
          )}

          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter password"
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="demo-users">
          <h3>Demo Accounts</h3>
          <p className="subtext">Use password shown on each button.</p>
          <div className="demo-grid">
            <button type="button" onClick={() => fillDemoUser("ADMIN-001", "admin123")}>
              ADMIN-001 / admin123
            </button>
            <button type="button" onClick={() => fillDemoUser("PLAYER-001", "player123")}>
              PLAYER-001 / player123
            </button>
            <button type="button" onClick={() => fillDemoUser("PLAYER-025", "player123")}>
              PLAYER-025 / player123
            </button>
            <button type="button" onClick={() => fillDemoUser("PLAYER-050", "player123")}>
              PLAYER-050 / player123
            </button>
            <button type="button" onClick={() => fillDemoUser("PLAYER-CITY", "player123")}>
              PLAYER-CITY / player123
            </button>
          </div>
        </div>

        {demoUsers.length > 0 && (
          <div className="demo-list">
            <h4>Available demo IDs</h4>
            <ul>
              {demoUsers.map((user) => (
                <li key={user.id}>
                  {user.id} | {user.name} | {user.role}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;