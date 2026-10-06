import { useEffect, useState } from "react";
import { getAllSubmissions, getStats } from "../api";

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats().then(setStats).catch((e) => setError(e.message));
    getAllSubmissions().then(setSubmissions).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="page"><p className="error-text">{error}</p></div>;

  return (
    <div className="page page-wide">
      <h2 className="page-title">Security posture</h2>
      <p className="page-sub">Submission volume and risk distribution across your organization.</p>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Emails scanned</div>
            <div className="stat-value">{stats.total_scanned}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">High risk flagged</div>
            <div className="stat-value" style={{ color: "#D6483C" }}>{stats.high_risk_count}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average risk score</div>
            <div className="stat-value">{stats.average_score}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Recent submissions</div>
        <table>
          <thead>
            <tr><th>Subject</th><th>Sender</th><th>Risk</th></tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id}>
                <td>{s.subject || "(no subject)"}</td>
                <td className="mono" style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{s.sender_email}</td>
                <td><span className={`pill pill-${s.risk_level}`}>{s.risk_level} · {s.risk_score}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && <p className="empty-note">No submissions yet.</p>}
      </div>
    </div>
  );
}
