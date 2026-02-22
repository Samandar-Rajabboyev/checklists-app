import { useState, useEffect, useCallback } from "react";

const SEED_DATA = {
  id: "flashcards-app-v1",
  title: "FlashCards App",
  description: "Simple, easy-to-use flashcard app with pre-loaded decks.",
  created_at: "2026-02-22",
  total_days: 12,
  color: "#D4522A",
  emoji: "🃏",
  phases: [
    {
      id: "phase-0",
      label: "Phase 0",
      title: "Setup",
      duration: "1 day",
      tasks: [
        { id: "p0-t1", text: "Initialize project (Flutter or React Native)", done: false },
        { id: "p0-t2", text: "Set up local storage / DB (Hive or SQLite)", done: false },
        { id: "p0-t3", text: "Define design tokens — colors, type, spacing", done: false },
        { id: "p0-t4", text: "Create base navigation (bottom bar or tabs)", done: false }
      ]
    },
    {
      id: "phase-1",
      label: "Phase 1",
      title: "Pre-loaded Decks",
      duration: "2 days",
      tasks: [
        { id: "p1-t1", text: "Define Card & Deck data models", done: false },
        { id: "p1-t2", text: "Build seed data — Flags deck", done: false, tag: "Flags" },
        { id: "p1-t3", text: "Build seed data — World Capitals deck", done: false, tag: "World Capitals" },
        { id: "p1-t4", text: "Build seed data — Simple Math deck", done: false, tag: "Simple Math" },
        { id: "p1-t5", text: "Build seed data — Interesting Facts deck", done: false, tag: "Interesting Facts" },
        { id: "p1-t6", text: "Auto-seed decks on first launch", done: false }
      ]
    },
    {
      id: "phase-2",
      label: "Phase 2",
      title: "Core Study Screen",
      duration: "3 days",
      tasks: [
        { id: "p2-t1", text: "Deck list home screen", done: false },
        { id: "p2-t2", text: "Flashcard flip animation (tap to reveal)", done: false },
        { id: "p2-t3", text: "Swipe right = know it · Swipe left = review again", done: false },
        { id: "p2-t4", text: "Session complete screen with score summary", done: false },
        { id: "p2-t5", text: "Shuffle & restart deck controls", done: false }
      ]
    },
    {
      id: "phase-3",
      label: "Phase 3",
      title: "Custom Decks",
      duration: "2 days",
      tasks: [
        { id: "p3-t1", text: "Create new deck flow (name + emoji/color)", done: false },
        { id: "p3-t2", text: "Add / edit / delete cards in a deck", done: false },
        { id: "p3-t3", text: "Delete decks (protect pre-loaded ones)", done: false }
      ]
    },
    {
      id: "phase-4",
      label: "Phase 4",
      title: "Polish",
      duration: "2 days",
      tasks: [
        { id: "p4-t1", text: "Empty states for all screens", done: false },
        { id: "p4-t2", text: "Haptic feedback on swipe actions", done: false },
        { id: "p4-t3", text: "Dark mode support", done: false },
        { id: "p4-t4", text: "Onboarding tooltip or quick tutorial card", done: false },
        { id: "p4-t5", text: "App icon + splash screen", done: false }
      ]
    },
    {
      id: "phase-5",
      label: "Phase 5",
      title: "Launch",
      duration: "2 days",
      tasks: [
        { id: "p5-t1", text: "App Store screenshots + description", done: false },
        { id: "p5-t2", text: "Google Play listing assets", done: false },
        { id: "p5-t3", text: "Submit for review", done: false }
      ]
    }
  ]
};

const ACCENT_COLORS = ["#D4522A", "#2A6DD4", "#2AA65A", "#8B2AD4", "#D4A22A"];

const uid = () => Math.random().toString(36).slice(2, 10);

const getProgress = (checklist) => {
  let done = 0, total = 0;
  for (const phase of checklist.phases) {
    for (const task of phase.tasks) {
      total++;
      if (task.done) done++;
    }
  }
  return { done, total };
};

const loadData = () => {
  try {
    const raw = localStorage.getItem("checklists-v1");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [SEED_DATA];
};

const saveData = (data) => {
  localStorage.setItem("checklists-v1", JSON.stringify(data));
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #F5F0E8;
    color: #1A1814;
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
  }

  .serif { font-family: 'Fraunces', serif; font-weight: 600; }

  .app { max-width: 900px; margin: 0 auto; padding: 0 24px 60px; }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 40px 0 20px;
    border-bottom: 1.5px solid #1A1814;
    margin-bottom: 36px;
  }

  .header h1 { font-size: 2.4rem; line-height: 1; }

  .btn-new {
    background: #1A1814;
    color: #F5F0E8;
    border: none;
    padding: 7px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    cursor: pointer;
    letter-spacing: 0.04em;
  }
  .btn-new:hover { background: #333; }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }

  .card {
    background: #FFFDF7;
    border: 1px solid #E2DDD4;
    padding: 22px 20px 18px;
    cursor: pointer;
  }
  .card:hover { background: #FAF6EE; }

  .card-emoji { font-size: 1.5rem; margin-bottom: 8px; }
  .card-title { font-size: 1.2rem; margin-bottom: 6px; }
  .card-desc { color: #8C8579; font-size: 0.72rem; line-height: 1.5; margin-bottom: 14px; }

  .progress-bar-bg {
    height: 3px;
    background: #E2DDD4;
    margin-bottom: 6px;
  }
  .progress-bar-fill { height: 100%; background: #D4522A; }

  .progress-label { font-size: 0.68rem; color: #8C8579; margin-bottom: 10px; }
  .progress-label-large {
    font-size: 0.78rem;
    color: #8C8579;
    letter-spacing: 0.06em;
    margin-bottom: 14px;
    text-transform: uppercase;
  }
  .card-duration { font-size: 0.68rem; color: #8C8579; }

  /* Detail view */
  .detail { }

  .detail-header {
    padding: 36px 0 22px;
    border-bottom: 1.5px solid #1A1814;
    margin-bottom: 36px;
  }
  .detail-header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .detail-title-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .detail-back-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .detail-subtitle {
    font-size: 0.7rem;
    color: #8C8579;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-left: 0;
  }
  .back-btn {
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 1rem;
    cursor: pointer;
    color: #1A1814;
    padding: 0;
    line-height: 1;
  }
  .back-btn:hover { color: #D4522A; }
  .detail-actions { display: flex; gap: 12px; }
  .action-btn {
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    cursor: pointer;
    color: #8C8579;
    padding: 0;
    letter-spacing: 0.03em;
  }
  .action-btn:hover { color: #1A1814; }
  .action-btn.danger:hover { color: #D4522A; }

  .confirm-delete {
    font-size: 0.72rem;
    color: #D4522A;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .confirm-btn {
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    cursor: pointer;
    color: #8C8579;
    text-decoration: underline;
    padding: 0;
  }
  .confirm-btn:hover { color: #1A1814; }
  .confirm-btn.yes { color: #D4522A; }

  .phase-section { margin-bottom: 36px; }

  .phase-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #1A1814;
    color: #F5F0E8;
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    padding: 6px 12px;
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  .tasks-list {
    border: 1px solid #E2DDD4;
    background: #FFFDF7;
  }

  .task-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border-bottom: 1px solid #E2DDD4;
    cursor: pointer;
  }
  .task-row:last-child { border-bottom: none; }
  .task-row:hover { background: #FAF6EE; }

  .checkbox {
    width: 16px;
    height: 16px;
    border: 1.5px solid #8C8579;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: white;
    cursor: pointer;
  }
  .checkbox.checked {
    background: #D4522A;
    border-color: #D4522A;
  }

  .task-text {
    font-size: 0.78rem;
    line-height: 1.4;
    flex: 1;
  }
  .task-text.done { text-decoration: line-through; color: #8C8579; }

  .tag {
    font-size: 0.62rem;
    letter-spacing: 0.05em;
    padding: 2px 6px;
    border: 1px solid #E2DDD4;
    color: #8C8579;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .add-task-row {
    padding: 9px 14px;
    border-top: 1px solid #E2DDD4;
    background: #FFFDF7;
  }
  .add-task-input {
    width: 100%;
    border: none;
    background: transparent;
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    color: #1A1814;
    outline: none;
  }
  .add-task-input::placeholder { color: #B8B2A8; }

  .add-task-link {
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: #8C8579;
    cursor: pointer;
    padding: 8px 14px;
    display: block;
  }
  .add-task-link:hover { color: #D4522A; }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(26,24,20,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 24px;
  }

  .modal {
    background: #F5F0E8;
    border: 1.5px solid #1A1814;
    width: 100%;
    max-width: 620px;
    max-height: 85vh;
    overflow-y: auto;
    padding: 30px 28px;
  }

  .modal-title { font-size: 1.4rem; margin-bottom: 24px; }

  .field { margin-bottom: 16px; }
  .field label {
    display: block;
    font-size: 0.68rem;
    color: #8C8579;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .field input, .field textarea {
    width: 100%;
    background: #FFFDF7;
    border: 1px solid #E2DDD4;
    font-family: 'DM Mono', monospace;
    font-size: 0.82rem;
    color: #1A1814;
    padding: 8px 10px;
    outline: none;
  }
  .field input:focus, .field textarea:focus { border-color: #8C8579; }
  .field textarea { resize: vertical; min-height: 60px; }

  .color-swatches { display: flex; gap: 8px; }
  .swatch {
    width: 24px;
    height: 24px;
    cursor: pointer;
    border: 2px solid transparent;
  }
  .swatch.selected { border-color: #1A1814; }

  .modal-phases { margin-top: 20px; }
  .modal-phase {
    border: 1px solid #E2DDD4;
    background: #FFFDF7;
    padding: 14px;
    margin-bottom: 12px;
  }
  .modal-phase-header {
    display: grid;
    grid-template-columns: 1fr 1fr 80px auto;
    gap: 8px;
    margin-bottom: 10px;
    align-items: start;
  }
  .modal-phase-header input {
    background: #F5F0E8;
    border: 1px solid #E2DDD4;
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    padding: 5px 8px;
    color: #1A1814;
    outline: none;
    width: 100%;
  }
  .remove-btn {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: #8C8579;
    padding: 4px;
    line-height: 1;
  }
  .remove-btn:hover { color: #D4522A; }

  .phase-tasks { }
  .phase-task-row {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }
  .phase-task-row input {
    flex: 1;
    background: #F5F0E8;
    border: 1px solid #E2DDD4;
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    padding: 5px 8px;
    color: #1A1814;
    outline: none;
  }

  .small-link {
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    color: #8C8579;
    cursor: pointer;
    padding: 4px 0;
    text-decoration: underline;
  }
  .small-link:hover { color: #1A1814; }

  .modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #E2DDD4;
  }

  .btn-save {
    background: #1A1814;
    color: #F5F0E8;
    border: none;
    padding: 8px 18px;
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    cursor: pointer;
    letter-spacing: 0.04em;
  }
  .btn-save:hover { background: #333; }

  .btn-cancel {
    background: none;
    border: 1px solid #E2DDD4;
    color: #8C8579;
    padding: 8px 18px;
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    cursor: pointer;
    letter-spacing: 0.04em;
  }
  .btn-cancel:hover { border-color: #8C8579; color: #1A1814; }

  .empty { text-align: center; color: #8C8579; font-size: 0.82rem; padding: 60px 0; }
`;

// ──── Modal Component ────────────────────────────────────────────────────────

function Modal({ initial, onSave, onClose }) {
  const [emoji, setEmoji] = useState(initial?.emoji || "📋");
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [color, setColor] = useState(initial?.color || "#D4522A");
  const [duration, setDuration] = useState(
    initial?.total_days ? `~${initial.total_days} days` : ""
  );
  const [phases, setPhases] = useState(
    initial?.phases?.map(p => ({
      id: p.id,
      label: p.label,
      title: p.title,
      duration: p.duration,
      tasks: p.tasks.map(t => ({ id: t.id, text: t.text, tag: t.tag || "", done: t.done }))
    })) || [{ id: uid(), label: "Phase 0", title: "", duration: "", tasks: [{ id: uid(), text: "", tag: "", done: false }] }]
  );

  const addPhase = () => setPhases(p => [...p, { id: uid(), label: `Phase ${p.length}`, title: "", duration: "", tasks: [{ id: uid(), text: "", tag: "", done: false }] }]);
  const removePhase = (pid) => setPhases(p => p.filter(ph => ph.id !== pid));
  const updatePhaseField = (pid, field, val) => setPhases(p => p.map(ph => ph.id === pid ? { ...ph, [field]: val } : ph));
  const addTask = (pid) => setPhases(p => p.map(ph => ph.id === pid ? { ...ph, tasks: [...ph.tasks, { id: uid(), text: "", tag: "", done: false }] } : ph));
  const removeTask = (pid, tid) => setPhases(p => p.map(ph => ph.id === pid ? { ...ph, tasks: ph.tasks.filter(t => t.id !== tid) } : ph));
  const updateTask = (pid, tid, val) => setPhases(p => p.map(ph => ph.id === pid ? { ...ph, tasks: ph.tasks.map(t => t.id === tid ? { ...t, text: val } : t) } : ph));

  const handleSave = () => {
    if (!title.trim()) return;
    const daysNum = parseInt(duration) || null;
    onSave({
      id: initial?.id || uid(),
      emoji, title: title.trim(), description: desc.trim(),
      color, total_days: daysNum,
      created_at: initial?.created_at || new Date().toISOString().slice(0, 10),
      phases: phases.map(ph => ({
        id: ph.id, label: ph.label, title: ph.title, duration: ph.duration,
        tasks: ph.tasks.filter(t => t.text.trim()).map(t => ({ id: t.id, text: t.text, done: t.done, ...(t.tag ? { tag: t.tag } : {}) }))
      })).filter(ph => ph.title || ph.tasks.length)
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title serif">{initial ? "Edit Checklist" : "New Checklist"}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, marginBottom: 16 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Emoji</label>
            <input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={4} style={{ textAlign: "center", fontSize: "1.4rem" }} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="My Checklist" />
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this for?" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Duration</label>
            <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="~12 days" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Accent Color</label>
            <div className="color-swatches">
              {ACCENT_COLORS.map(c => (
                <div key={c} className={`swatch${color === c ? " selected" : ""}`}
                  style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>
        </div>

        <div className="modal-phases">
          <div style={{ fontSize: "0.68rem", color: "#8C8579", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Phases</div>
          {phases.map((ph, pi) => (
            <div className="modal-phase" key={ph.id}>
              <div className="modal-phase-header">
                <input value={ph.label} onChange={e => updatePhaseField(ph.id, "label", e.target.value)} placeholder="Phase 0" />
                <input value={ph.title} onChange={e => updatePhaseField(ph.id, "title", e.target.value)} placeholder="Title" />
                <input value={ph.duration} onChange={e => updatePhaseField(ph.id, "duration", e.target.value)} placeholder="2 days" />
                <button className="remove-btn" onClick={() => removePhase(ph.id)}>×</button>
              </div>
              <div className="phase-tasks">
                {ph.tasks.map(t => (
                  <div className="phase-task-row" key={t.id}>
                    <input value={t.text} onChange={e => updateTask(ph.id, t.id, e.target.value)} placeholder="Task description" />
                    <button className="remove-btn" onClick={() => removeTask(ph.id, t.id)}>×</button>
                  </div>
                ))}
                <button className="small-link" onClick={() => addTask(ph.id)}>+ add task</button>
              </div>
            </div>
          ))}
          <button className="small-link" onClick={addPhase}>+ add phase</button>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ──── Home Screen ─────────────────────────────────────────────────────────────

function Home({ checklists, onSelect, onNew }) {
  return (
    <div className="app">
      <div className="header">
        <h1 className="serif">Checklists</h1>
        <button className="btn-new" onClick={onNew}>+ New</button>
      </div>
      {checklists.length === 0 ? (
        <div className="empty">No checklists yet. Create one with + New.</div>
      ) : (
        <div className="grid">
          {checklists.map(cl => {
            const { done, total } = getProgress(cl);
            const pct = total ? (done / total) * 100 : 0;
            return (
              <div className="card" key={cl.id} onClick={() => onSelect(cl.id)}>
                <div className="card-emoji">{cl.emoji}</div>
                <div className="card-title serif">{cl.title}</div>
                {cl.description && <div className="card-desc">{cl.description}</div>}
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: cl.color || "#D4522A" }} />
                </div>
                <div className="progress-label">{done} / {total} complete</div>
                {cl.total_days && <div className="card-duration">~{cl.total_days} days</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──── Detail Screen ───────────────────────────────────────────────────────────

function Detail({ checklist, onChange, onBack, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingTask, setAddingTask] = useState(null); // phaseId
  const [newTaskText, setNewTaskText] = useState("");

  const { done, total } = getProgress(checklist);
  const pct = total ? (done / total) * 100 : 0;
  const accent = checklist.color || "#D4522A";

  const toggleTask = (phaseId, taskId) => {
    const updated = {
      ...checklist,
      phases: checklist.phases.map(ph =>
        ph.id !== phaseId ? ph : {
          ...ph,
          tasks: ph.tasks.map(t => t.id !== taskId ? t : { ...t, done: !t.done })
        }
      )
    };
    onChange(updated);
  };

  const commitNewTask = (phaseId) => {
    if (!newTaskText.trim()) { setAddingTask(null); setNewTaskText(""); return; }
    const updated = {
      ...checklist,
      phases: checklist.phases.map(ph =>
        ph.id !== phaseId ? ph : {
          ...ph,
          tasks: [...ph.tasks, { id: uid(), text: newTaskText.trim(), done: false }]
        }
      )
    };
    onChange(updated);
    setNewTaskText("");
    setAddingTask(null);
  };

  return (
    <div className="app">
      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-title-row">
            <div className="detail-back-row">
              <button className="back-btn" onClick={onBack}>←</button>
              <h1 className="serif" style={{ fontSize: "1.8rem", lineHeight: 1 }}>{checklist.emoji} {checklist.title}</h1>
            </div>
            <div className="detail-subtitle">App Build Checklist — Solo Dev</div>
          </div>
          {confirmDelete ? (
            <div className="confirm-delete">
              Delete?&nbsp;
              <button className="confirm-btn yes" onClick={onDelete}>yes</button>
              <button className="confirm-btn" onClick={() => setConfirmDelete(false)}>cancel</button>
            </div>
          ) : (
            <div className="detail-actions">
              <button className="action-btn" onClick={onEdit}>[edit]</button>
              <button className="action-btn danger" onClick={() => setConfirmDelete(true)}>[delete]</button>
            </div>
          )}
        </div>
        <div className="progress-label-large">{done} / {total} Complete</div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: accent }} />
        </div>
      </div>

      {checklist.phases.map(ph => (
        <div className="phase-section" key={ph.id}>
          <div className="phase-label">
            <span style={{ color: accent }}>●</span>
            {ph.label} — {ph.title}{ph.duration ? ` · ${ph.duration}` : ""}
          </div>
          <div className="tasks-list">
            {ph.tasks.map(task => (
              <div className="task-row" key={task.id} onClick={() => toggleTask(ph.id, task.id)}>
                <div className={`checkbox${task.done ? " checked" : ""}`}>
                  {task.done && "✓"}
                </div>
                <span className={`task-text${task.done ? " done" : ""}`}>{task.text}</span>
                {task.tag && <span className="tag">{task.tag}</span>}
              </div>
            ))}
            {addingTask === ph.id ? (
              <div className="add-task-row">
                <input
                  className="add-task-input"
                  autoFocus
                  placeholder="New task..."
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") commitNewTask(ph.id);
                    if (e.key === "Escape") { setAddingTask(null); setNewTaskText(""); }
                  }}
                  onBlur={() => commitNewTask(ph.id)}
                />
              </div>
            ) : (
              <button className="add-task-link" onClick={() => setAddingTask(ph.id)}>+ add task</button>
            )}
          </div>
        </div>
      ))}

      {checklist.total_days && (
        <div style={{ textAlign: "center", color: "#8C8579", fontSize: "0.7rem", marginTop: 40, borderTop: "1px solid #E2DDD4", paddingTop: 16 }}>
          ~{checklist.total_days} DAYS TOTAL · SOLO DEV &nbsp;&nbsp;&nbsp; {checklist.title.toUpperCase()} V1.0
        </div>
      )}
    </div>
  );
}

// ──── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  const [checklists, setChecklists] = useState(() => loadData());
  const [view, setView] = useState("home"); // "home" | "detail"
  const [activeId, setActiveId] = useState(null);
  const [modal, setModal] = useState(null); // null | "new" | "edit"

  const persist = useCallback((next) => {
    setChecklists(next);
    saveData(next);
  }, []);

  const handleSelect = (id) => { setActiveId(id); setView("detail"); };
  const handleBack = () => { setView("home"); setActiveId(null); };

  const handleSave = (data) => {
    if (modal === "new") {
      persist([...checklists, data]);
    } else {
      persist(checklists.map(cl => cl.id === data.id ? data : cl));
      setActiveId(data.id);
    }
    setModal(null);
  };

  const handleChange = (updated) => {
    persist(checklists.map(cl => cl.id === updated.id ? updated : cl));
  };

  const handleDelete = () => {
    persist(checklists.filter(cl => cl.id !== activeId));
    setView("home");
    setActiveId(null);
  };

  const active = checklists.find(cl => cl.id === activeId);

  return (
    <>
      <style>{styles}</style>
      {view === "home" ? (
        <Home checklists={checklists} onSelect={handleSelect} onNew={() => setModal("new")} />
      ) : active ? (
        <Detail
          checklist={active}
          onChange={handleChange}
          onBack={handleBack}
          onEdit={() => setModal("edit")}
          onDelete={handleDelete}
        />
      ) : null}

      {modal && (
        <Modal
          initial={modal === "edit" ? active : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
