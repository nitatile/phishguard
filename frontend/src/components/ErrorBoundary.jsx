import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("PhishGuard UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-shell">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div className="auth-mark" style={{ margin: "0 auto 18px" }}>!</div>
            <h2 className="auth-title">Something went wrong</h2>
            <p className="auth-sub">
              An unexpected error occurred. Reloading usually fixes this.
            </p>
            <button className="btn btn-primary btn-block" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
