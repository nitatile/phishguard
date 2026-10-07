import { useEffect, useState } from "react";
import { getAllSubmissions, getStats } from "../api";
import { DEMO_STATS, DEMO_SUBMISSIONS } from "../demoData";

function exportCsv(submissions) {
  const header = "Subject,Sender,Risk Level,Risk Score\n";
  const rows = submissions
    .map((s) => [s.subject || "(no subject)", s.sender_email, s.risk_level, s.risk_score]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","))
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "phishguard-submissions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function SkeletonDashboard() {
  return (
    <div className="page page-wide">
      <h2 className="page-title">Security posture</h2>
      <p className="page-sub">Submission volume and risk distribution across your organization.</p>
      <div className="stat-grid">
        {[0, 1, 2].map((i) => (
          <div className="stat-card skeleton-card" key={i}>
            <div className="skeleton-line" style={{ width: "60%" }} />
            <div className="skeleton-line" style={{ width: "40%", height: 24, marginTop: 10 }} />
          </div>
        ))}
      </div>
      <div className="card">
        <div className="skeleton-line" style={{ width: 140, marginBottom: 18 }} />
        {[0, 1, 2, 3].map((i) => (
          <div className="skeleton-line" key={i} style={{ width: "100%", height: 16, marginBottom: 14 }} />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getStats(), getAllSubmissions()])
      .then(([statsData, subsData]) => {
        setStats(statsData);
        setSubmissions(subsData);
        setUsingDemo(false);
      })
      .catch((e) => {
        // Fall back to demo data so the dashboard is never blank/broken, e.g. during a live demo.
        setStats(DEMO_STATS);
        setSubmissions(DEMO_SUBMISSIONS);
        setUsingDemo(true);
        setError(e.message || "Couldn't reach the server.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="page page-wide">
      <h2 className="page-title">Security posture</h2>
      <p className="page-sub">Submission volume and risk distribution across your organization.</p>

      {usingDemo && (
        <div className="notice-banner">
          Showing demo data — live connection unavailable.
          <button className="btn-text" style={{ marginLeft: 10 }} onClick={load}>Retry</button>
        </div>
      )}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Emails scanned</div>
            <div className="stat-value">{stats.total_scanned}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">High risk flagged</div>
            <div className="stat-value" style={{ color: "#E11D48" }}>{stats.high_risk_count}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average risk score</div>
            <div className="stat-value">{stats.average_score}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="field-row-between">
          <div className="card-title" style={{ marginBottom: 0 }}>Recent submissions</div>
          <button className="btn-text" onClick={() => exportCsv(submissions)} disabled={submissions.length === 0}>
            Export CSV
          </button>
        </div>
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
        {submissions.length === 0 && <p className="empty-note">No submissions yet — scanned emails will appear here.</p>}
      </div>
    </div>
  );
}
