import { useEffect } from "react";

// ──── HelpOverlay ─────────────────────────────────────────────────────────────

export function HelpOverlay({ onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" || e.key === "?") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const section = (title, rows) => (
    <div className="help-section">
      <div className="help-section-title">{title}</div>
      {rows.map(([k, d]) => (
        <div className="help-row" key={k}>
          <kbd>{k}</kbd>
          <span>{d}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div
      className="help-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="help-box">
        <div className="help-title serif">Keyboard Shortcuts</div>
        {section("Home", [
          ["j/k", "navigate"],
          ["h/l", "grid columns"],
          ["Enter", "open"],
          ["n", "new"],
          ["i", "import JSON"],
          ["T", "cycle theme"],
          ["v", "cycle view"],
          ["Tab", "filter tab"],
          ["?", "help"],
        ])}
        {section("Detail", [
          ["j/k", "move between tasks"],
          ["V", "visual mode"],
          ["J/K", "reorder task"],
          ["H/L", "move to prev/next phase"],
          ["[/]", "reorder phase up/down"],
          ["z", "toggle phase collapse"],
          ["x · Enter", "toggle done"],
          ["P", "toggle whole phase"],
          ["dd", "delete task (then y/n)"],
          ["e", "edit"],
          ["a", "archive"],
          ["E", "export JSON"],
          ["d", "delete checklist"],
          ["b · Esc", "back"],
          ["Ctrl+D", "half page down"],
          ["Ctrl+U", "half page up"],
          ["/", "search tasks"],
          ["n/N", "next/prev match"],
          ["?", "help"],
        ])}
        {section("Visual Mode (multi-select)", [
          ["j/k", "extend selection"],
          ["x", "toggle all"],
          ["J/K", "move all up/down"],
          ["H/L", "move all to prev/next phase"],
          ["dd", "delete selected"],
          ["V · Esc", "exit"],
        ])}
        {section("Goal editor", [
          ["Enter", "next task"],
          ["Enter on empty line", "new phase"],
          ["Shift+Enter", "new phase"],
          ["↑/↓", "move between lines"],
          ["Alt+↑/↓", "reorder task / phase"],
          ["Backspace on empty", "delete line"],
          ["paste a list", "one task per line, # heading = phase"],
          ["Ctrl/⌘+Enter", "save"],
          ["Esc", "close (asks if unsaved)"],
        ])}
        <div className="help-close">
          press <kbd>?</kbd> or <kbd>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
