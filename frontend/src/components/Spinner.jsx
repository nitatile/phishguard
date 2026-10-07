export default function Spinner({ size = 16, inline = true }) {
  const style = {
    width: size,
    height: size,
    display: inline ? "inline-block" : "block",
  };
  return (
    <svg style={style} viewBox="0 0 24 24" className="spinner" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
