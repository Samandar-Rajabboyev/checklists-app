import { useState, useRef, useEffect } from "react";
import { ACCENT_COLORS } from "../constants.js";
import { uid } from "../lib/storage.js";

// ──── Category templates ────────────────────────────────────────────────────
// Starter phases/tasks offered when creating a NEW goal, keyed by category.
// Picking one just seeds the `phases` state below — fully editable after.

const TEMPLATES = {
  software: {
    label: "Software Project",
    emoji: "💻",
    phases: [
      {
        label: "Phase 0",
        title: "Planning",
        duration: "",
        tasks: ["Define scope & requirements", "Pick stack & tooling", "Set up repo & CI"],
      },
      {
        label: "Phase 1",
        title: "Build",
        duration: "",
        tasks: ["Implement core features", "Write tests", "Code review pass"],
      },
      {
        label: "Phase 2",
        title: "Launch",
        duration: "",
        tasks: ["Deploy to production", "Write docs / README", "Announce & gather feedback"],
      },
    ],
  },
  study: {
    label: "Study Plan",
    emoji: "📚",
    phases: [
      {
        label: "Phase 0",
        title: "Foundations",
        duration: "",
        tasks: ["Gather materials / syllabus", "Skim overview & build a roadmap"],
      },
      {
        label: "Phase 1",
        title: "Core Learning",
        duration: "",
        tasks: ["Work through main material", "Take notes & summarize each unit", "Do practice exercises"],
      },
      {
        label: "Phase 2",
        title: "Review & Assess",
        duration: "",
        tasks: ["Take a practice test", "Review weak areas", "Final review session"],
      },
    ],
  },
  business: {
    label: "Business Plan",
    emoji: "📈",
    phases: [
      {
        label: "Phase 0",
        title: "Validate",
        duration: "",
        tasks: ["Define target customer", "Talk to potential customers", "Validate pricing"],
      },
      {
        label: "Phase 1",
        title: "Build",
        duration: "",
        tasks: ["Build MVP / offer", "Set up basic operations", "Prepare launch assets"],
      },
      {
        label: "Phase 2",
        title: "Grow",
        duration: "",
        tasks: ["Launch to first customers", "Set up tracking / metrics", "Iterate on feedback"],
      },
    ],
  },
  blank: {
    label: "Blank",
    emoji: "📋",
    phases: [{ label: "Phase 0", title: "", duration: "", tasks: [""] }],
  },
};

function buildPhasesFromTemplate(key) {
  const tpl = TEMPLATES[key];
  if (!tpl) return null;
  return tpl.phases.map((ph) => ({
    id: uid(),
    label: ph.label,
    title: ph.title,
    duration: ph.duration,
    tasks: ph.tasks.map((text) => ({
      id: uid(),
      text,
      tag: "",
      done: false,
      priority: "none",
      due_date: "",
    })),
  }));
}

const CATEGORIES = [
  { id: "software", label: "Software" },
  { id: "study", label: "Study" },
  { id: "business", label: "Business" },
  { id: "personal", label: "Personal" },
  { id: "custom", label: "Custom" },
];

const PRIORITIES = [
  { id: "none", label: "—", color: "var(--text-muted)" },
  { id: "low", label: "L", color: "#2AA65A" },
  { id: "medium", label: "M", color: "#D4A22A" },
  { id: "high", label: "H", color: "#D4522A" },
];
const nextPriority = (p) => {
  const i = PRIORITIES.findIndex((x) => x.id === (p || "none"));
  return PRIORITIES[(i + 1) % PRIORITIES.length].id;
};

// ──── Modal ───────────────────────────────────────────────────────────────────

export function Modal({ initial, onSave, onClose }) {
  const [emoji, setEmoji] = useState(initial?.emoji || "📋");
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [color, setColor] = useState(initial?.color || "#D4522A");
  const [category, setCategory] = useState(initial?.category || "custom");
  const [duration, setDuration] = useState(
    initial?.total_days ? `~${initial.total_days} days` : "",
  );
  // Only offer the blank-page template picker for brand-new goals.
  const [templatePicked, setTemplatePicked] = useState(!!initial);
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
        priority: t.priority || "none",
        due_date: t.due_date || "",
      })),
    })) || [
      {
        id: uid(),
        label: "Phase 0",
        title: "",
        duration: "",
        tasks: [{ id: uid(), text: "", tag: "", done: false, priority: "none", due_date: "" }],
      },
    ],
  );
  const lastPhaseId = useRef(phases[phases.length - 1]?.id);

  const pickTemplate = (key) => {
    const built = buildPhasesFromTemplate(key);
    if (built) {
      setPhases(built);
      lastPhaseId.current = built[built.length - 1]?.id;
    }
    if (key !== "blank" && TEMPLATES[key]) {
      setCategory(key);
      if (!emoji || emoji === "📋") setEmoji(TEMPLATES[key].emoji);
    }
    setTemplatePicked(true);
    setTimeout(() => {
      document.querySelector(".modal-title-input")?.focus();
    }, 30);
  };

  const addPhase = () => {
    const np = {
      id: uid(),
      label: `Phase ${phases.length}`,
      title: "",
      duration: "",
      tasks: [{ id: uid(), text: "", tag: "", done: false, priority: "none", due_date: "" }],
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
      tasks: [{ id: uid(), text: "", tag: "", done: false, priority: "none", due_date: "" }],
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
                { id: uid(), text: "", tag: "", done: false, priority: "none", due_date: "" },
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
  const updateTaskField = (pid, tid, field, v) =>
    setPhases((p) =>
      p.map((ph) =>
        ph.id === pid
          ? {
              ...ph,
              tasks: ph.tasks.map((t) =>
                t.id === tid ? { ...t, [field]: v } : t,
              ),
            }
          : ph,
      ),
    );
  const cycleTaskPriority = (pid, tid) =>
    setPhases((p) =>
      p.map((ph) =>
        ph.id === pid
          ? {
              ...ph,
              tasks: ph.tasks.map((t) =>
                t.id === tid ? { ...t, priority: nextPriority(t.priority) } : t,
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
      category,
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
              priority: t.priority || "none",
              due_date: t.due_date || null,
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
              className="modal-title-input"
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
        <div className="field">
          <label>Category</label>
          <div className="category-picker">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`category-btn${category === c.id ? " selected" : ""}`}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {!templatePicked && (
          <div className="field">
            <label>Quick Start</label>
            <div className="template-picker">
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  type="button"
                  className="template-btn"
                  onClick={() => pickTemplate(key)}
                >
                  <span className="template-btn-emoji">{tpl.emoji}</span>
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        )}
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
                {ph.tasks.map((t) => {
                  const pr =
                    PRIORITIES.find((p) => p.id === (t.priority || "none")) ||
                    PRIORITIES[0];
                  return (
                    <div className="phase-task-row" key={t.id}>
                      <button
                        type="button"
                        className="priority-dot"
                        title={`Priority: ${pr.id} (click to cycle)`}
                        style={{ color: pr.color, borderColor: pr.color }}
                        onClick={() => cycleTaskPriority(ph.id, t.id)}
                      >
                        {pr.label}
                      </button>
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
                      <input
                        type="date"
                        className="task-due-input"
                        value={t.due_date || ""}
                        title="Due date"
                        onChange={(e) =>
                          updateTaskField(ph.id, t.id, "due_date", e.target.value)
                        }
                      />
                      <button
                        className="remove-btn"
                        onClick={() => removeTask(ph.id, t.id)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
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
