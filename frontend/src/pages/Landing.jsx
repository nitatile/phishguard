export default function Landing({ goToLogin, goToRegister }) {
  return (
    <div className="auth-shell">
      <div className="landing-card">
        <div className="auth-mark">P</div>
        <h1 className="landing-title">PhishGuard</h1>
        <p className="landing-sub">
          A BEC and phishing detection platform that catches the subtle, easily
          overlooked signs of a fraudulent email — before you click.
        </p>

        <div className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-dot" />
            <div>
              <div className="landing-feature-title">Risk scoring</div>
              <div className="landing-feature-text">Every submitted email is scored and flagged by severity.</div>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-dot" />
            <div>
              <div className="landing-feature-title">Security training</div>
              <div className="landing-feature-text">Practice spotting phishing with interactive scenarios.</div>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-dot" />
            <div>
              <div className="landing-feature-title">Organization dashboard</div>
              <div className="landing-feature-text">Track submission volume and risk trends at a glance.</div>
            </div>
          </div>
        </div>

        <div className="landing-actions">
          <button className="btn btn-primary btn-block" onClick={goToLogin}>Log in</button>
          <button className="btn btn-secondary btn-block" onClick={goToRegister}>Create an account</button>
        </div>
      </div>
    </div>
  );
}
