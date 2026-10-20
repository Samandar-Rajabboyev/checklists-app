// ──── KeyHintBar ──────────────────────────────────────────────────────────────

export function KeyHintBar({ hints, mode = "NORMAL" }) {
  return (
    <div className="keyhint-bar">
      <span className="keyhint-mode">{mode}</span>
      {hints.map((h, i) => (
        <span key={i} className="keyhint-item">
          <kbd>{h.key}</kbd>
          <span className="keyhint-label">{h.label}</span>
        </span>
      ))}
    </div>
  );
}
