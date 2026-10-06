import { useState, useEffect } from "react";
import "./styles.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitEmail from "./pages/SubmitEmail";
import Dashboard from "./pages/Dashboard";
import Training from "./pages/Training";
import { loadToken, clearToken } from "./api";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [page, setPage] = useState("submit");

  useEffect(() => {
    const token = loadToken();
    if (token) setAuthed(true);
  }, []);

  if (!authed) {
    return authView === "login" ? (
      <Login onLoginSuccess={() => setAuthed(true)} goToRegister={() => setAuthView("register")} />
    ) : (
      <Register goToLogin={() => setAuthView("login")} />
    );
  }

  return (
    <div className="app-shell">
      <nav className="topnav">
        <div className="brand">
          <div className="brand-mark">P</div>
          <span className="brand-name">PhishGuard</span>
        </div>
        <button className={`nav-link ${page === "submit" ? "active" : ""}`} onClick={() => setPage("submit")}>Submit Email</button>
        <button className={`nav-link ${page === "training" ? "active" : ""}`} onClick={() => setPage("training")}>Training</button>
        <button className={`nav-link ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>Admin Dashboard</button>
        <button
          className="nav-link nav-spacer"
          onClick={() => { clearToken(); setAuthed(false); }}
        >
          Log out
        </button>
      </nav>

      {page === "submit" && <SubmitEmail />}
      {page === "training" && <Training />}
      {page === "dashboard" && <Dashboard />}
    </div>
  );
}
