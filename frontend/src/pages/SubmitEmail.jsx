import { useState } from "react";
import { scanEmail } from "../api";
import ScoreGauge from "./ScoreGauge";

export default function SubmitEmail() {
  const [rawEmail, setRawEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleScan() {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await scanEmail(rawEmail);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">Submit an email for inspection</h2>
      <p className="page-sub">
        Paste the raw headers and body of a suspicious email. PhishGuard checks
        sender authenticity, link integrity, and language patterns.
      </p>

      <div className="card">
        <textarea
          className="mono-input"
          value={rawEmail}
          onChange={(e) => setRawEmail(e.target.value)}
          placeholder="Paste the raw email here…"
          rows={11}
        />
        <button
          onClick={handleScan}
          disabled={loading || !rawEmail}
          className="btn btn-primary"
          style={{ marginTop: 14 }}
        >
          {loading ? "Scanning…" : "Scan email"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>

      {result && (
        <div className="result-wrap card">
          <div className="result-header">
            <ScoreGauge score={result.risk_score} level={result.risk_level} />
            <div>
              <div className="result-meta-title">Risk assessment</div>
              <div className="result-level" style={{
                color: result.risk_level === "high" ? "#D6483C" : result.risk_level === "medium" ? "#C6892E" : "#1E9166"
              }}>
                {result.risk_level} risk
              </div>
              <div className="result-from">
                From {result.sender_display_name || "unknown sender"} &lt;{result.sender_email}&gt;
              </div>
            </div>
          </div>

          <div className="card-title">Flags detected</div>
          {result.flags.length === 0 && <p className="empty-note">No red flags detected in this email.</p>}
          {result.flags.map((flag, i) => (
            <div key={i} className="flag-row" style={{ animationDelay: `${i * 0.05}s` }}>
              <div>
                <div className="flag-name">{flag.flag_type.replace(/_/g, " ")}</div>
                <div className="flag-detail">{flag.detail_text}</div>
              </div>
              <div className="flag-pts">+{flag.points_assigned}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
