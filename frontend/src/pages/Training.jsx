import { useEffect, useState } from "react";
import { getScenarios, submitAnswer } from "../api";

export default function Training() {
  const [scenarios, setScenarios] = useState([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    getScenarios().then(setScenarios);
  }, []);

  if (scenarios.length === 0) return <div className="page"><p className="empty-note">Loading scenarios…</p></div>;

  if (index >= scenarios.length) {
    return (
      <div className="page">
        <h2 className="page-title">Nice work</h2>
        <p className="page-sub">You scored {score} out of {scenarios.length}.</p>
      </div>
    );
  }

  const scenario = scenarios[index];

  async function handleAnswer(answer) {
    const result = await submitAnswer(scenario.id, answer);
    setFeedback(result);
    if (result.correct) setScore((s) => s + 1);
  }

  function nextScenario() {
    setFeedback(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="page">
      <h2 className="page-title">Spot the phish</h2>
      <p className="page-sub">Scenario {index + 1} of {scenarios.length}</p>

      <div className="quiz-progress">
        {scenarios.map((_, i) => (
          <span key={i} className={i < index ? "done" : ""} />
        ))}
      </div>

      <div className="card">
        <div className="mail-preview">
          <div className="mail-row"><span className="mail-label">FROM</span><span>{scenario.sender_display}</span></div>
          <div className="mail-row"><span className="mail-label">SUBJECT</span><span>{scenario.email_subject}</span></div>
          <div className="mail-body">{scenario.email_body}</div>
        </div>

        {!feedback ? (
          <div className="quiz-choices">
            <button className="choice-btn" onClick={() => handleAnswer("phishing")}>🚩 This is phishing</button>
            <button className="choice-btn" onClick={() => handleAnswer("safe")}>✓ This is safe</button>
          </div>
        ) : (
          <div className="feedback-box">
            <div className={`feedback-verdict ${feedback.correct ? "correct" : "incorrect"}`}>
              {feedback.correct ? "Correct" : "Not quite"}
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
              {feedback.explanation}
            </p>
            <button className="btn btn-primary" onClick={nextScenario}>Next scenario</button>
          </div>
        )}
      </div>
    </div>
  );
}
