import { useState } from "react";
import { api } from "../utils/api";

function LoginPage({ onAuthSuccess }) {
const [mode, setMode] = useState("login");
const [id, setId] = useState("");
const [name, setName] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const demoAccounts = [
    { id: "ADMIN-001", pass: "admin123", label: "Admin (All Unlocked)", icon: "👑" },
    { id: "PLAYER-001", pass: "player123", label: "Fresh Start", icon: "🌱" },
    { id: "PLAYER-025", pass: "player123", label: "Day 25 Progress", icon: "📈" },
    { id: "PLAYER-050", pass: "player123", label: "Completed Household", icon: "🏠" },
    { id: "PLAYER-CITY", pass: "player123", label: "City Progress", icon: "🏙️" },
];

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

function quickLogin(userId, pass) {
    setError("");
    setLoading(true);
    api.login({ id: userId, password: pass })
    .then((result) => onAuthSuccess(result.user))
    .catch((err) => { setError(err.message); setLoading(false); });
}

return (
    <div className="auth-page">
    <div className="auth-card">
        <div className="auth-brand">
        <div className="auth-brand-icon">🌿</div>
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

        <div className="demo-users">
        <h3>Quick Start — Demo Accounts</h3>
        <p className="subtext">Click to log in instantly.</p>
        <div className="demo-grid">
            {demoAccounts.map((d) => (
            <button key={d.id} type="button" onClick={() => quickLogin(d.id, d.pass)} disabled={loading} className="demo-btn">
                <span className="demo-icon">{d.icon}</span>
                <span className="demo-label">{d.label}</span>
                <span className="demo-id">{d.id}</span>
            </button>
            ))}
        </div>
        </div>
    </div>
    </div>
);
}

export default LoginPage;