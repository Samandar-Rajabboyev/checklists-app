import { useState } from "react";

// ──── Checkins ────────────────────────────────────────────────────────────────
// A minimal progress journal attached to a goal: dated notes, newest first.
// Intentionally not a comments system — just a text input + add, and a
// quiet way to delete an entry.

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function Checkins({ checkins, onAdd, onDelete }) {
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(checkins.length > 0);
  const [confirmId, setConfirmId] = useState(null);

  const submit = () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNote("");
    setOpen(true);
  };

  return (
    <div className="checkins-section">
      <div
        className="checkins-header"
        onClick={() => setOpen((o) => !o)}
      >
        <span>
          Check-ins{checkins.length ? ` (${checkins.length})` : ""}
        </span>
        <span className="checkins-collapse-icon">{open ? "▼" : "▶"}</span>
      </div>

      {open && (
        <>
          <div className="checkins-add-row">
            <input
              className="checkins-input"
              value={note}
              placeholder="Log progress…"
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <button
              className="checkins-add-btn"
              disabled={!note.trim()}
              onClick={submit}
            >
              add
            </button>
          </div>

          {checkins.length === 0 ? (
            <div className="checkins-empty">No check-ins yet.</div>
          ) : (
            <div className="checkins-list">
              {checkins.map((ci) => (
                <div className="checkin-row" key={ci.id}>
                  <span className="checkin-date">{formatDate(ci.created_at)}</span>
                  <span className="checkin-note">{ci.note}</span>
                  {confirmId === ci.id ? (
                    <span className="checkin-confirm">
                      <button
                        className="confirm-btn yes"
                        onClick={() => {
                          onDelete(ci.id);
                          setConfirmId(null);
                        }}
                      >
                        yes
                      </button>
                      <button
                        className="confirm-btn"
                        onClick={() => setConfirmId(null)}
                      >
                        no
                      </button>
                    </span>
                  ) : (
                    <button
                      className="checkin-del"
                      title="Delete check-in"
                      onClick={() => setConfirmId(ci.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
