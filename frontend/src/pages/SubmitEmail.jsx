import { useState } from "react";
import { scanEmail } from "../api";
import ScoreGauge from "./ScoreGauge";
import Spinner from "../components/Spinner";
import Tooltip from "../components/Tooltip";
import { SAMPLE_PHISHING_EMAIL } from "../demoData";

const LEVEL_COLOR = { high: "#E11D48", medium: "#D97706", low: "#059669" };

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
      setError(err.message || "Couldn't reach the scanning service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setError("");
    setResult(null);
    setRawEmail(SAMPLE_PHISHING_EMAIL);
  }

  return (
    <div className="page">
      <h2 className="page-title">Submit an email for inspection</h2>
      <p className="page-sub">
        Paste the raw headers and body of a suspicious email. PhishGuard checks
        sender authenticity, link integrity, and language patterns.
      </p>

      <div className="card">
        <div className="field-row-between">
          <label className="field-top-label">Raw email</label>
          <button type="button" className="btn-text" onClick={loadSample}>Try a sample email</button>
        </div>
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
          {loading ? (<><Spinner size={15} /> Scanning…</>) : "Scan email"}
        </button>
        {error && (
          <p className="error-text">
            {error} The sample email above still works offline for demo purposes.
          </p>
        )}
      </div>

      {result && (
        <div className="result-wrap card">
          <div className="result-header">
            <ScoreGauge score={result.risk_score} level={result.risk_level} />
            <div>
              <div className="result-meta-title">
                Risk assessment
                <Tooltip text="The risk score (0–100) reflects how many suspicious signals — like sender spoofing, mismatched links, or urgency language — were detected. Higher means more likely to be phishing." />
              </div>
              <div className="result-level" style={{ color: LEVEL_COLOR[result.risk_level] || LEVEL_COLOR.low }}>
                {result.risk_level} risk
              </div>
              <div className="result-from">
                From {result.sender_display_name || "unknown sender"} &lt;{result.sender_email}&gt;
              </div>
            </div>
          </div>

          <div className="card-title">
            Flags detected
            <Tooltip text="Each flag is a specific indicator PhishGuard found in the email — for example, a sender domain that looks similar to a trusted one, or a link that doesn't match its displayed text." />
          </div>
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
