import { useState } from "react";

export default function Tooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="tooltip-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      <span className="tooltip-icon" aria-label="More info">i</span>
      {open && <span className="tooltip-bubble">{text}</span>}
    </span>
  );
}
