import { useState, useRef, useEffect } from "react";
import { ACCENT_COLORS } from "../constants.js";
import { uid } from "../lib/storage.js";

// ──── Modal ───────────────────────────────────────────────────────────────────

export function Modal({ initial, onSave, onClose }) {
  const [emoji, setEmoji] = useState(initial?.emoji || "📋");
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [color, setColor] = useState(initial?.color || "#D4522A");
  const [duration, setDuration] = useState(
    initial?.total_days ? `~${initial.total_days} days` : "",
  );
  const [phases, setPhases] = useState(
    initial?.phases?.map((p) => ({
      id: p.id,
      label: p.label,
      title: p.title,
      duration: p.duration,
      tasks: p.tasks.map((t) => ({
        id: t.id,
        text: t.text,
        tag: t.tag || "",
        done: t.done,
      })),
    })) || [
      {
        id: uid(),
        label: "Phase 0",
        title: "",
        duration: "",
        tasks: [{ id: uid(), text: "", tag: "", done: false }],
      },
    ],
  );
  const lastPhaseId = useRef(phases[phases.length - 1]?.id);

  const addPhase = () => {
    const np = {
      id: uid(),
      label: `Phase ${phases.length}`,
      title: "",
      duration: "",
      tasks: [{ id: uid(), text: "", tag: "", done: false }],
    };
    setPhases((p) => [...p, np]);
    lastPhaseId.current = np.id;
    setTimeout(() => {
      const el = document.querySelector(
        ".modal-phase:last-child .modal-phase-header input",
      );
      if (el) el.focus();
    }, 30);
  };
  const insertPhaseAfter = (pid) => {
    const np = {
      id: uid(),
      label: `Phase ${phases.length}`,
      title: "",
      duration: "",
      tasks: [{ id: uid(), text: "", tag: "", done: false }],
    };
    setPhases((p) => {
      const i = p.findIndex((ph) => ph.id === pid);
      const a = [...p];
      a.splice(i + 1, 0, np);
      return a;
    });
    lastPhaseId.current = np.id;
  };
  const movePhase = (pid, dir) =>
    setPhases((p) => {
      const i = p.findIndex((ph) => ph.id === pid),
        to = dir === "up" ? i - 1 : i + 1;
      if (to < 0 || to >= p.length) return p;
      const a = [...p];
      [a[i], a[to]] = [a[to], a[i]];
      return a;
    });
  const removePhase = (pid) =>
    setPhases((p) => p.filter((ph) => ph.id !== pid));
  const updatePhase = (pid, f, v) =>
    setPhases((p) => p.map((ph) => (ph.id === pid ? { ...ph, [f]: v } : ph)));
  const addTask = (pid) => {
    setPhases((p) =>
      p.map((ph) =>
        ph.id === pid
          ? {
              ...ph,
              tasks: [
                ...ph.tasks,
                { id: uid(), text: "", tag: "", done: false },
              ],
            }
          : ph,
      ),
    );
    setTimeout(() => {
      const ph = document.querySelector(`.modal-phase[data-id="${pid}"]`);
      if (ph) {
        const ins = ph.querySelectorAll(".phase-task-row input");
        if (ins[ins.length - 1]) ins[ins.length - 1].focus();
      }
    }, 30);
  };
  const removeTask = (pid, tid) =>
    setPhases((p) =>
      p.map((ph) =>
        ph.id === pid
          ? { ...ph, tasks: ph.tasks.filter((t) => t.id !== tid) }
          : ph,
      ),
    );
  const updateTask = (pid, tid, v) =>
    setPhases((p) =>
      p.map((ph) =>
        ph.id === pid
          ? {
              ...ph,
              tasks: ph.tasks.map((t) =>
                t.id === tid ? { ...t, text: v } : t,
              ),
            }
          : ph,
      ),
    );

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: initial?.id || uid(),
      emoji,
      title: title.trim(),
      description: desc.trim(),
      color,
      total_days: parseInt(duration) || null,
      created_at: initial?.created_at || new Date().toISOString().slice(0, 10),
      phases: phases
        .map((ph) => ({
          id: ph.id,
          label: ph.label,
          title: ph.title,
          duration: ph.duration,
          tasks: ph.tasks
            .filter((t) => t.text.trim())
            .map((t) => ({
              id: t.id,
              text: t.text,
              done: t.done,
              ...(t.tag ? { tag: t.tag } : {}),
            })),
        }))
        .filter((ph) => ph.title || ph.tasks.length),
    });
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        addPhase();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        const pid = lastPhaseId.current;
        if (pid) addTask(pid);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, phases]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <h2 className="modal-title serif">
          {initial ? "Edit Checklist" : "New Checklist"}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Emoji</label>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
              style={{ textAlign: "center", fontSize: "1.4rem" }}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Checklist"
            />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What's this for?"
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Duration</label>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="~12 days"
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Accent Color</label>
            <div className="color-swatches">
              {ACCENT_COLORS.map((c) => (
                <div
                  key={c}
                  className={`swatch${color === c ? " selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-phases">
          <div
            style={{
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            Phases
          </div>
          {phases.map((ph, pi) => (
            <div className="modal-phase" key={ph.id} data-id={ph.id}>
              <div className="modal-phase-header">
                <input
                  value={ph.label}
                  onChange={(e) => updatePhase(ph.id, "label", e.target.value)}
                  placeholder="Phase 0"
                  onFocus={() => {
                    lastPhaseId.current = ph.id;
                  }}
                />
                <input
                  value={ph.title}
                  onChange={(e) => updatePhase(ph.id, "title", e.target.value)}
                  placeholder="Title"
                  onFocus={() => {
                    lastPhaseId.current = ph.id;
                  }}
                />
                <input
                  value={ph.duration}
                  onChange={(e) =>
                    updatePhase(ph.id, "duration", e.target.value)
                  }
                  placeholder="2 days"
                  onFocus={() => {
                    lastPhaseId.current = ph.id;
                  }}
                />
                <div style={{ display: "flex", gap: 2 }}>
                  <button
                    className="remove-btn"
                    title="Move up"
                    onClick={() => movePhase(ph.id, "up")}
                  >
                    ↑
                  </button>
                  <button
                    className="remove-btn"
                    title="Move down"
                    onClick={() => movePhase(ph.id, "down")}
                  >
                    ↓
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removePhase(ph.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="phase-tasks">
                {ph.tasks.map((t) => (
                  <div className="phase-task-row" key={t.id}>
                    <input
                      value={t.text}
                      onChange={(e) => updateTask(ph.id, t.id, e.target.value)}
                      placeholder="Task description"
                      onFocus={() => {
                        lastPhaseId.current = ph.id;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTask(ph.id);
                        }
                        if (e.key === "Backspace" && t.text === "") {
                          e.preventDefault();
                          removeTask(ph.id, t.id);
                        }
                      }}
                    />
                    <button
                      className="remove-btn"
                      onClick={() => removeTask(ph.id, t.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button className="small-link" onClick={() => addTask(ph.id)}>
                  + add task
                </button>
              </div>
              <button
                className="small-link"
                style={{ marginTop: 4, display: "block" }}
                onClick={() => insertPhaseAfter(ph.id)}
              >
                + insert phase below
              </button>
            </div>
          ))}
          <button className="small-link" onClick={addPhase}>
            + add phase at end
          </button>
        </div>
        <div className="modal-footer">
          <div className="modal-keyhints">
            {[
              ["Tab", "next field"],
              ["Ctrl+Enter", "save"],
              ["Ctrl+P", "add phase"],
              ["Ctrl+T", "add task"],
              ["Esc", "close"],
            ].map(([k, l]) => (
              <span key={k}>
                <kbd>{k}</kbd>
                {l}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
