import { useState } from "react";
import { registerUser } from "../api";
import Spinner from "../components/Spinner";

export default function Register({ goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < 8;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(name, email, password, department);
      goToLogin();
    } catch (err) {
      setError(err.message || "Couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-mark">P</div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-sub">Join your organization's PhishGuard workspace.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nita Okafor" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
            <p className="field-hint" style={{ color: passwordTooShort ? "var(--danger)" : undefined }}>
              At least 8 characters
            </p>
          </div>
          <div className="field">
            <label>Department (optional)</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Finance" />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? (<><Spinner size={15} /> Creating account…</>) : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <button className="btn-text" onClick={goToLogin}>Log in</button>
        </p>
      </div>
    </div>
  );
}
