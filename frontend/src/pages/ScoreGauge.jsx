const COLORS = { high: "#E11D48", medium: "#D97706", low: "#059669" };

export default function ScoreGauge({ score, level }) {
  const size = 84;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = COLORS[level] || COLORS.low;

  return (
    <svg width={size} height={size} className="gauge" style={{ transform: "rotate(-90deg)" }}>
      <circle
        className="gauge-ring-bg"
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" strokeWidth={stroke}
      />
      <circle
        className="gauge-ring-fill"
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" strokeWidth={stroke}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text
        x="50%" y="50%"
        textAnchor="middle" dominantBaseline="middle"
        className="gauge-score"
        fill={color}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
      >
        {score}
      </text>
    </svg>
  );
}
