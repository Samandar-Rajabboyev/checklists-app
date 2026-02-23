import { useState, useEffect, useCallback, useRef } from "react";

// ──── Utils ───────────────────────────────────────────────────────────────────

const ACCENT_COLORS = ["#D4522A", "#2A6DD4", "#2AA65A", "#8B2AD4", "#D4A22A"];
const uid = () => Math.random().toString(36).slice(2, 10);

const getProgress = (checklist) => {
  let done = 0, total = 0;
  for (const phase of checklist.phases) {
    for (const task of phase.tasks) {
      total++; if (task.done) done++;
    }
  }
  return { done, total };
};

const loadData = () => {
  try {
    const raw = localStorage.getItem("checklists-v2");
    if (raw) return JSON.parse(raw);
    const v1 = localStorage.getItem("checklists-v1");
    if (v1) return JSON.parse(v1);
  } catch {}
  return [];
};
const saveData = (data) => localStorage.setItem("checklists-v2", JSON.stringify(data));

// ──── Confetti ────────────────────────────────────────────────────────────────

function Confetti({ onDone }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      r: 4 + Math.random() * 6,
      color: ["#D4522A","#2A6DD4","#2AA65A","#D4A22A","#1A1814"][Math.floor(Math.random()*5)],
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 8,
    }));
    let frame, alive = true;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let any = false;
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.vy += 0.05;
        if (p.y < canvas.height + 20) any = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.6);
        ctx.restore();
      }
      if (any && alive) frame = requestAnimationFrame(draw);
      else onDone();
    };
    draw();
    return () => { alive = false; cancelAnimationFrame(frame); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:200}} />;
}

// ──── Styles ──────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F5F0E8; color: #1A1814; font-family: 'DM Mono', monospace; min-height: 100vh; padding-bottom: 34px; }
  .serif { font-family: 'Fraunces', serif; font-weight: 600; }
  .app { max-width: 960px; margin: 0 auto; padding: 0 24px 60px; }

  .header { display:flex; align-items:center; justify-content:space-between; padding:36px 0 18px; border-bottom:1.5px solid #1A1814; margin-bottom:24px; gap:12px; flex-wrap:wrap; }
  .header h1 { font-size: 2.2rem; line-height: 1; }
  .header-right { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

  .btn { border:none; font-family:'DM Mono',monospace; font-size:0.72rem; cursor:pointer; padding:7px 13px; letter-spacing:0.04em; }
  .btn-dark { background:#1A1814; color:#F5F0E8; }
  .btn-dark:hover { background:#333; }
  .btn-muted { background:none; border:1px solid #E2DDD4; color:#8C8579; }
  .btn-muted:hover { border-color:#8C8579; color:#1A1814; }

  .search-bar { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
  .search-input { flex:1; background:#FFFDF7; border:1px solid #E2DDD4; font-family:'DM Mono',monospace; font-size:0.82rem; padding:8px 12px; color:#1A1814; outline:none; }
  .search-input:focus { border-color:#8C8579; }
  .search-clear { background:none; border:none; font-size:1rem; cursor:pointer; color:#8C8579; padding:0 4px; line-height:1; }
  .search-clear:hover { color:#D4522A; }

  .filter-tabs { display:flex; border:1px solid #E2DDD4; width:fit-content; }
  .filter-tab { background:none; border:none; border-right:1px solid #E2DDD4; font-family:'DM Mono',monospace; font-size:0.66rem; padding:5px 13px; cursor:pointer; color:#8C8579; letter-spacing:0.04em; }
  .filter-tab:last-child { border-right:none; }
  .filter-tab.active { background:#1A1814; color:#F5F0E8; }

  .view-toggle { display:flex; gap:4px; align-items:center; }
  .view-toggle-label { font-size:0.63rem; color:#8C8579; letter-spacing:0.06em; text-transform:uppercase; margin-right:4px; }
  .view-btn { background:none; border:1px solid #E2DDD4; font-family:'DM Mono',monospace; font-size:0.66rem; padding:4px 10px; cursor:pointer; color:#8C8579; }
  .view-btn.active { background:#1A1814; color:#F5F0E8; border-color:#1A1814; }

  .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
  @media (max-width:600px) { .grid { grid-template-columns:1fr; } }
  .list-view { display:flex; flex-direction:column; gap:8px; }
  .compact-view { display:flex; flex-direction:column; border:1px solid #E2DDD4; }

  .card { background:#FFFDF7; border:1px solid #E2DDD4; padding:20px 18px 16px; cursor:pointer; }
  .card:hover { background:#FAF6EE; }
  .card.focused { background:#FAF6EE; outline:2px solid #D4522A; outline-offset:-2px; }
  .card-archived { opacity:0.55; }
  .card-emoji { font-size:1.4rem; margin-bottom:7px; }
  .card-title { font-size:1.1rem; margin-bottom:5px; }
  .card-desc { color:#8C8579; font-size:0.7rem; line-height:1.5; margin-bottom:12px; }
  .card-meta { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  .card-duration { font-size:0.64rem; color:#8C8579; }
  .card-archived-badge { font-size:0.6rem; color:#8C8579; border:1px solid #E2DDD4; padding:1px 5px; letter-spacing:0.05em; text-transform:uppercase; }

  .list-card { background:#FFFDF7; border:1px solid #E2DDD4; padding:11px 14px; cursor:pointer; display:flex; align-items:center; gap:12px; }
  .list-card:hover, .list-card.focused { background:#FAF6EE; }
  .list-card.focused { outline:2px solid #D4522A; outline-offset:-2px; }
  .list-card-emoji { font-size:1.1rem; flex-shrink:0; }
  .list-card-body { flex:1; min-width:0; }
  .list-card-title { font-size:0.88rem; margin-bottom:2px; }
  .list-card-desc { font-size:0.66rem; color:#8C8579; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .list-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:3px; flex-shrink:0; }

  .compact-card { background:#FFFDF7; border-bottom:1px solid #E2DDD4; padding:8px 13px; cursor:pointer; display:flex; align-items:center; gap:10px; }
  .compact-card:last-child { border-bottom:none; }
  .compact-card:hover, .compact-card.focused { background:#FAF6EE; }
  .compact-card.focused { outline:2px solid #D4522A; outline-offset:-2px; }
  .compact-card-emoji { font-size:0.95rem; flex-shrink:0; }
  .compact-card-title { font-size:0.76rem; flex:1; }
  .compact-progress-text { font-size:0.63rem; color:#8C8579; flex-shrink:0; }

  .progress-bar-bg { height:3px; background:#E2DDD4; margin-bottom:5px; }
  .progress-bar-fill { height:100%; }
  .progress-label { font-size:0.64rem; color:#8C8579; }
  .progress-label-large { font-size:0.74rem; color:#8C8579; letter-spacing:0.06em; margin-bottom:12px; text-transform:uppercase; }

  .detail-header { padding:32px 0 18px; border-bottom:1.5px solid #1A1814; margin-bottom:28px; }
  .detail-header-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
  .detail-title-row { display:flex; flex-direction:column; gap:5px; }
  .detail-back-row { display:flex; align-items:center; gap:10px; }
  .detail-subtitle { font-size:0.66rem; color:#8C8579; letter-spacing:0.08em; text-transform:uppercase; }
  .back-btn { background:none; border:none; font-family:'DM Mono',monospace; font-size:1rem; cursor:pointer; color:#1A1814; padding:0; line-height:1; }
  .back-btn:hover { color:#D4522A; }
  .detail-actions { display:flex; gap:10px; flex-wrap:wrap; }
  .action-btn { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.68rem; cursor:pointer; color:#8C8579; padding:0; }
  .action-btn:hover { color:#1A1814; }
  .action-btn.danger:hover { color:#D4522A; }
  .confirm-delete { font-size:0.7rem; color:#D4522A; display:flex; align-items:center; gap:8px; }
  .confirm-btn { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.7rem; cursor:pointer; color:#8C8579; text-decoration:underline; padding:0; }
  .confirm-btn:hover { color:#1A1814; }
  .confirm-btn.yes { color:#D4522A; }

  .phase-section { margin-bottom:28px; }
  .phase-label { display:inline-flex; align-items:center; gap:7px; background:#1A1814; color:#F5F0E8; font-family:'DM Mono',monospace; font-size:0.64rem; letter-spacing:0.08em; padding:5px 11px; margin-bottom:10px; text-transform:uppercase; }
  .tasks-list { border:1px solid #E2DDD4; background:#FFFDF7; }

  .task-row { display:flex; flex-direction:column; padding:11px 15px; border-bottom:1px solid #E2DDD4; cursor:pointer; }
  .task-row:last-child { border-bottom:none; }
  .task-row:hover { background:#FAF6EE; }
  .task-row.focused { background:#FAF6EE; outline:2px solid #D4522A; outline-offset:-2px; }
  .task-row-main { display:flex; align-items:center; gap:11px; }

  .checkbox { width:15px; height:15px; border:1.5px solid #8C8579; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:10px; color:white; cursor:pointer; }
  .checkbox.checked { background:#D4522A; border-color:#D4522A; }

  .task-body { flex:1; min-width:0; }
  .task-text { font-size:0.75rem; line-height:1.4; }
  .task-text.done { text-decoration:line-through; color:#8C8579; }
  .task-actions { display:flex; gap:8px; align-items:center; margin-top:3px; flex-wrap:wrap; }
  .tag { font-size:0.58rem; letter-spacing:0.05em; padding:1px 5px; border:1px solid #E2DDD4; color:#8C8579; white-space:nowrap; text-transform:uppercase; }


  .task-row[draggable="true"] { cursor: grab; }
  .task-row[draggable="true"]:active { cursor: grabbing; }
  .task-row.drag-over { border-top: 2px solid #D4522A; }
  .task-row.dragging { opacity: 0.35; }
  .drag-handle { color: #C8C3BA; font-size: 0.7rem; cursor: grab; padding: 0 4px 0 0; flex-shrink:0; user-select:none; line-height:1; }
  .drag-handle:hover { color: #8C8579; }
  .phase-drop-zone { height: 6px; transition: height 0.1s; }
  .phase-drop-zone.drag-over { height: 20px; background: #FAF6EE; border: 1px dashed #D4522A; }
  .task-row.move-mode { outline: 2px solid #D4A22A; outline-offset: -2px; background: #FAF6EE; }

  .add-task-row { padding:8px 13px; border-top:1px solid #E2DDD4; background:#FFFDF7; }
  .add-task-input { width:100%; border:none; background:transparent; font-family:'DM Mono',monospace; font-size:0.75rem; color:#1A1814; outline:none; }
  .add-task-input::placeholder { color:#B8B2A8; }
  .add-task-link { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.68rem; color:#8C8579; cursor:pointer; padding:8px 13px; display:block; }
  .add-task-link:hover { color:#D4522A; }

  .modal-overlay { position:fixed; inset:0; background:rgba(26,24,20,0.55); display:flex; align-items:center; justify-content:center; z-index:100; padding:24px; }
  .modal { background:#F5F0E8; border:1.5px solid #1A1814; width:100%; max-width:600px; max-height:85vh; overflow-y:auto; padding:26px 24px; }
  .modal-title { font-size:1.3rem; margin-bottom:20px; }
  .field { margin-bottom:13px; }
  .field label { display:block; font-size:0.64rem; color:#8C8579; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:4px; }
  .field input, .field textarea { width:100%; background:#FFFDF7; border:1px solid #E2DDD4; font-family:'DM Mono',monospace; font-size:0.78rem; color:#1A1814; padding:6px 9px; outline:none; }
  .field input:focus, .field textarea:focus { border-color:#8C8579; }
  .field textarea { resize:vertical; min-height:52px; }
  .color-swatches { display:flex; gap:7px; margin-top:4px; }
  .swatch { width:21px; height:21px; cursor:pointer; border:2px solid transparent; }
  .swatch.selected { border-color:#1A1814; }
  .modal-phases { margin-top:16px; }
  .modal-phase { border:1px solid #E2DDD4; background:#FFFDF7; padding:11px; margin-bottom:9px; }
  .modal-phase-header { display:grid; grid-template-columns:1fr 1fr 76px auto; gap:5px; margin-bottom:7px; align-items:start; }
  .modal-phase-header input { background:#F5F0E8; border:1px solid #E2DDD4; font-family:'DM Mono',monospace; font-size:0.7rem; padding:4px 6px; color:#1A1814; outline:none; width:100%; }
  .phase-task-row { display:flex; gap:5px; align-items:center; margin-bottom:5px; }
  .phase-task-row input { flex:1; background:#F5F0E8; border:1px solid #E2DDD4; font-family:'DM Mono',monospace; font-size:0.7rem; padding:4px 6px; color:#1A1814; outline:none; }
  .remove-btn { background:none; border:none; font-size:0.9rem; cursor:pointer; color:#8C8579; padding:3px; line-height:1; }
  .remove-btn:hover { color:#D4522A; }
  .small-link { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.66rem; color:#8C8579; cursor:pointer; padding:3px 0; text-decoration:underline; }
  .small-link:hover { color:#1A1814; }
  .modal-footer { display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid #E2DDD4; gap:10px; flex-wrap:wrap; }
  .modal-keyhints { display:flex; gap:12px; flex-wrap:wrap; align-items:center; font-size:0.58rem; color:#8C8579; }
  .modal-keyhints kbd { color:#1A1814; background:#E8E3D8; padding:1px 4px; border:1px solid #C8C3BA; font-family:'DM Mono',monospace; font-size:0.58rem; margin-right:2px; }
  .btn-save { background:#1A1814; color:#F5F0E8; border:none; padding:7px 15px; font-family:'DM Mono',monospace; font-size:0.7rem; cursor:pointer; }
  .btn-save:hover { background:#333; }
  .btn-cancel { background:none; border:1px solid #E2DDD4; color:#8C8579; padding:7px 15px; font-family:'DM Mono',monospace; font-size:0.7rem; cursor:pointer; }
  .btn-cancel:hover { border-color:#8C8579; color:#1A1814; }

  .keyhint-bar { position:fixed; bottom:0; left:0; right:0; background:#1A1814; color:#8C8579; font-family:'DM Mono',monospace; font-size:0.61rem; padding:6px 18px; display:flex; gap:14px; align-items:center; letter-spacing:0.03em; z-index:50; flex-wrap:wrap; }
  .keyhint-bar kbd { color:#F5F0E8; background:#2E2A25; padding:1px 4px; border:1px solid #3A3530; font-family:'DM Mono',monospace; font-size:0.61rem; margin-right:2px; }
  .keyhint-mode { color:#D4522A; font-size:0.64rem; letter-spacing:0.08em; margin-right:4px; }
  .keyhint-sep { color:#3A3530; user-select:none; }

  .help-overlay { position:fixed; inset:0; background:rgba(26,24,20,0.7); display:flex; align-items:center; justify-content:center; z-index:150; padding:24px; }
  .help-box { background:#F5F0E8; border:1.5px solid #1A1814; padding:26px; max-width:520px; width:100%; max-height:80vh; overflow-y:auto; }
  .help-title { font-size:1.15rem; margin-bottom:18px; }
  .help-section { margin-bottom:16px; }
  .help-section-title { font-size:0.6rem; color:#8C8579; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:7px; border-bottom:1px solid #E2DDD4; padding-bottom:4px; }
  .help-row { display:flex; justify-content:space-between; align-items:center; padding:3px 0; font-size:0.7rem; }
  .help-row kbd { background:#E8E3D8; border:1px solid #C8C3BA; padding:1px 5px; font-family:'DM Mono',monospace; font-size:0.66rem; }
  .help-close { margin-top:14px; font-size:0.68rem; color:#8C8579; text-align:center; }

  .empty { text-align:center; color:#8C8579; font-size:0.78rem; padding:60px 0; }
  .empty kbd { background:#E2DDD4; padding:1px 5px; font-family:'DM Mono',monospace; }
  .checklist-footer { text-align:center; color:#8C8579; font-size:0.66rem; margin-top:36px; border-top:1px solid #E2DDD4; padding-top:13px; }
  .err-msg { font-size:0.66rem; color:#D4522A; }
`;

// ──── KeyHintBar ──────────────────────────────────────────────────────────────

function KeyHintBar({ hints }) {
  return (
    <div className="keyhint-bar">
      <span className="keyhint-mode">NORMAL</span>
      <span className="keyhint-sep">|</span>
      {hints.map((h, i) => (
        <span key={i}>
          <kbd>{h.key}</kbd>{h.label}
          {i < hints.length - 1 && <span className="keyhint-sep" style={{marginLeft:12}}>·</span>}
        </span>
      ))}
    </div>
  );
}

// ──── HelpOverlay ─────────────────────────────────────────────────────────────

function HelpOverlay({ onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" || e.key === "?") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const sections = [
    { title: "Home", rows: [
      ["j/k · ↑↓", "navigate cards"], ["h/l · ←→", "navigate grid columns"],
      ["Enter", "open checklist"], ["n", "new checklist"], ["i", "import JSON"],
      ["/", "search"], ["v", "cycle view (grid / list / compact)"],
      ["Tab", "cycle filter (active / all / archived)"], ["?", "this help"],
    ]},
    { title: "Detail", rows: [
      ["j/k", "move between tasks"], ["J/K", "reorder task up/down"], ["H/L", "move task to prev/next phase"], ["x · Enter", "toggle task done"],
      ["e", "edit checklist"], ["a", "archive / unarchive"],
      ["P", "toggle whole phase done"], ["E", "export JSON"], ["d", "delete (then y / n)"],
      ["b · Esc", "go back"], ["g / G", "jump top / bottom"], ["?", "this help"],
    ]},
    { title: "Modal", rows: [
      ["Tab", "next field"], ["Ctrl+Enter", "save"],
      ["Ctrl+P", "add phase"], ["Ctrl+T", "add task to focused phase"],
      ["Enter", "next task (inside task input)"],
      ["Backspace", "delete empty task row"], ["Esc", "close"],
    ]},
  ];

  return (
    <div className="help-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="help-box">
        <h2 className="help-title serif">Keyboard Shortcuts</h2>
        {sections.map(s => (
          <div className="help-section" key={s.title}>
            <div className="help-section-title">{s.title}</div>
            {s.rows.map(([key, label]) => (
              <div className="help-row" key={key}>
                <span style={{color:"#8C8579"}}>{label}</span>
                <kbd>{key}</kbd>
              </div>
            ))}
          </div>
        ))}
        <div className="help-close">press <kbd>Esc</kbd> or <kbd>?</kbd> to close</div>
      </div>
    </div>
  );
}

// ──── Modal ───────────────────────────────────────────────────────────────────

function Modal({ initial, onSave, onClose }) {
  const [emoji, setEmoji] = useState(initial?.emoji || "📋");
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [color, setColor] = useState(initial?.color || "#D4522A");
  const [duration, setDuration] = useState(initial?.total_days ? `~${initial.total_days} days` : "");
  const [phases, setPhases] = useState(
    initial?.phases?.map(p => ({
      id: p.id, label: p.label, title: p.title, duration: p.duration,
      tasks: p.tasks.map(t => ({ id: t.id, text: t.text, tag: t.tag || "", done: t.done }))
    })) || [{ id: uid(), label: "Phase 0", title: "", duration: "", tasks: [{ id: uid(), text: "", tag: "", done: false }] }]
  );
  const lastPhaseId = useRef(phases[phases.length - 1]?.id);

  const addPhase = () => {
    const np = { id: uid(), label: `Phase ${phases.length}`, title: "", duration: "", tasks: [{ id: uid(), text: "", tag: "", done: false }] };
    setPhases(p => [...p, np]);
    lastPhaseId.current = np.id;
    setTimeout(() => document.querySelector(".modal-phase:last-child .modal-phase-header input")?.focus(), 30);
  };
  const removePhase = (pid) => setPhases(p => p.filter(ph => ph.id !== pid));
  const updatePhaseField = (pid, f, v) => setPhases(p => p.map(ph => ph.id === pid ? {...ph,[f]:v} : ph));
  const addTask = (pid) => {
    setPhases(p => p.map(ph => ph.id === pid ? {...ph, tasks:[...ph.tasks,{id:uid(),text:"",tag:"",done:false}]} : ph));
    setTimeout(() => {
      const el = document.querySelector(`.modal-phase[data-id="${pid}"]`);
      if (el) { const ins = el.querySelectorAll(".phase-task-row input"); ins[ins.length-1]?.focus(); }
    }, 30);
  };
  const removeTask = (pid, tid) => setPhases(p => p.map(ph => ph.id === pid ? {...ph,tasks:ph.tasks.filter(t=>t.id!==tid)} : ph));
  const updateTask = (pid, tid, v) => setPhases(p => p.map(ph => ph.id === pid ? {...ph,tasks:ph.tasks.map(t=>t.id===tid?{...t,text:v}:t)} : ph));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: initial?.id || uid(),
      emoji, title: title.trim(), description: desc.trim(),
      color, total_days: parseInt(duration) || null,
      created_at: initial?.created_at || new Date().toISOString().slice(0,10),
      archived: initial?.archived || false,
      phases: phases.map(ph => ({
        id: ph.id, label: ph.label, title: ph.title, duration: ph.duration,
        tasks: ph.tasks.filter(t => t.text.trim()).map(t => ({
          id: t.id, text: t.text, done: t.done,
          ...(t.tag ? {tag: t.tag} : {}),
          subtasks: t.subtasks || [], note: t.note || ""
        }))
      })).filter(ph => ph.title || ph.tasks.length)
    });
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if ((e.ctrlKey||e.metaKey) && e.key === "Enter") { e.preventDefault(); handleSave(); return; }
      if ((e.ctrlKey||e.metaKey) && e.key === "p") { e.preventDefault(); addPhase(); return; }
      if ((e.ctrlKey||e.metaKey) && e.key === "t") { e.preventDefault(); if (lastPhaseId.current) addTask(lastPhaseId.current); return; }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, phases]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title serif">{initial ? "Edit Checklist" : "New Checklist"}</h2>
        <div style={{display:"grid",gridTemplateColumns:"68px 1fr",gap:10,marginBottom:13}}>
          <div className="field" style={{marginBottom:0}}>
            <label>Emoji</label>
            <input value={emoji} onChange={e=>setEmoji(e.target.value)} maxLength={4} style={{textAlign:"center",fontSize:"1.3rem"}} />
          </div>
          <div className="field" style={{marginBottom:0}}>
            <label>Title</label>
            <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="My Checklist" />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What's this for?" />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
          <div className="field" style={{marginBottom:0}}>
            <label>Duration</label>
            <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="~12 days" />
          </div>
          <div className="field" style={{marginBottom:0}}>
            <label>Accent Color</label>
            <div className="color-swatches">
              {ACCENT_COLORS.map(c => <div key={c} className={`swatch${color===c?" selected":""}`} style={{background:c}} onClick={()=>setColor(c)} />)}
            </div>
          </div>
        </div>
        <div className="modal-phases">
          <div style={{fontSize:"0.64rem",color:"#8C8579",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7}}>Phases</div>
          {phases.map(ph => (
            <div className="modal-phase" key={ph.id} data-id={ph.id}>
              <div className="modal-phase-header">
                <input value={ph.label} onChange={e=>updatePhaseField(ph.id,"label",e.target.value)} placeholder="Phase 0" onFocus={()=>{lastPhaseId.current=ph.id;}} />
                <input value={ph.title} onChange={e=>updatePhaseField(ph.id,"title",e.target.value)} placeholder="Title" onFocus={()=>{lastPhaseId.current=ph.id;}} />
                <input value={ph.duration} onChange={e=>updatePhaseField(ph.id,"duration",e.target.value)} placeholder="2 days" onFocus={()=>{lastPhaseId.current=ph.id;}} />
                <button className="remove-btn" onClick={()=>removePhase(ph.id)}>×</button>
              </div>
              <div className="phase-tasks">
                {ph.tasks.map(t => (
                  <div className="phase-task-row" key={t.id}>
                    <input value={t.text} onChange={e=>updateTask(ph.id,t.id,e.target.value)} placeholder="Task description"
                      onFocus={()=>{lastPhaseId.current=ph.id;}}
                      onKeyDown={e=>{
                        if (e.key==="Enter"){e.preventDefault();addTask(ph.id);}
                        if (e.key==="Backspace"&&t.text===""){e.preventDefault();removeTask(ph.id,t.id);}
                      }} />
                    <button className="remove-btn" onClick={()=>removeTask(ph.id,t.id)}>×</button>
                  </div>
                ))}
                <button className="small-link" onClick={()=>addTask(ph.id)}>+ add task</button>
              </div>
            </div>
          ))}
          <button className="small-link" onClick={addPhase}>+ add phase</button>
        </div>
        <div className="modal-footer">
          <div className="modal-keyhints">
            {[["Tab","next"],["Ctrl+↵","save"],["Ctrl+P","phase"],["Ctrl+T","task"],["Esc","close"]].map(([k,l])=><span key={k}><kbd>{k}</kbd>{l}</span>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-save" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──── Home ────────────────────────────────────────────────────────────────────

const VIEWS = ["grid","list","compact"];
const FILTERS = ["active","all","archived"];

function Home({ checklists, onSelect, onNew, onImport }) {
  const [focusIdx, setFocusIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("active");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = checklists.filter(cl => {
    const mf = filter === "all" ? true : filter === "archived" ? cl.archived : !cl.archived;
    const ms = !search || cl.title.toLowerCase().includes(search.toLowerCase()) || (cl.description||"").toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  useEffect(() => { setFocusIdx(0); }, [filter, search, view]);

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) { if (!item.title || !Array.isArray(item.phases)) throw new Error(); if (!item.id) item.id = uid(); }
        onImport(items); setImportError("");
      } catch { setImportError("Invalid JSON."); setTimeout(()=>setImportError(""),3000); }
    };
    reader.readAsText(file); e.target.value="";
  };

  useEffect(() => {
    const h = (e) => {
      if (showSearch) { if (e.key==="Escape"){setShowSearch(false);setSearch("");} return; }
      if (document.activeElement.tagName==="INPUT") return;
      if (e.key==="/") { e.preventDefault(); setShowSearch(true); setTimeout(()=>searchRef.current?.focus(),20); return; }
      if (e.key==="j"||e.key==="ArrowDown") { e.preventDefault(); setFocusIdx(i=>Math.min(i+1,filtered.length-1)); }
      else if (e.key==="k"||e.key==="ArrowUp") { e.preventDefault(); setFocusIdx(i=>Math.max(i-1,0)); }
      else if (e.key==="l"||e.key==="ArrowRight") { e.preventDefault(); setFocusIdx(i=>Math.min(i+2,filtered.length-1)); }
      else if (e.key==="h"||e.key==="ArrowLeft") { e.preventDefault(); setFocusIdx(i=>Math.max(i-2,0)); }
      else if ((e.key==="Enter"||e.key===" ")&&filtered[focusIdx]) { e.preventDefault(); onSelect(filtered[focusIdx].id); }
      else if (e.key==="n") { e.preventDefault(); onNew(); }
      else if (e.key==="i") { e.preventDefault(); fileInputRef.current?.click(); }
      else if (e.key==="v") { e.preventDefault(); setView(v=>VIEWS[(VIEWS.indexOf(v)+1)%VIEWS.length]); }
      else if (e.key==="Tab") { e.preventDefault(); setFilter(f=>FILTERS[(FILTERS.indexOf(f)+1)%FILTERS.length]); }
      else if (e.key==="g") setFocusIdx(0);
      else if (e.key==="G") setFocusIdx(filtered.length-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [filtered, focusIdx, onSelect, onNew, showSearch]);

  const renderCard = (cl, idx) => {
    const { done, total } = getProgress(cl);
    const pct = total ? (done/total)*100 : 0;
    const accent = cl.color || "#D4522A";
    const isFocused = focusIdx === idx;
    const onClick = () => { setFocusIdx(idx); onSelect(cl.id); };
    const onEnter = () => setFocusIdx(idx);

    if (view === "compact") return (
      <div key={cl.id} className={`compact-card${isFocused?" focused":""}${cl.archived?" card-archived":""}`} onClick={onClick} onMouseEnter={onEnter}>
        <span className="compact-card-emoji">{cl.emoji}</span>
        <span className="compact-card-title serif">{cl.title}</span>
        <div className="progress-bar-bg" style={{width:70,flexShrink:0,marginBottom:0}}>
          <div className="progress-bar-fill" style={{width:`${pct}%`,background:accent}} />
        </div>
        <span className="compact-progress-text">{done}/{total}</span>
        {cl.archived && <span className="card-archived-badge">archived</span>}
      </div>
    );

    if (view === "list") return (
      <div key={cl.id} className={`list-card${isFocused?" focused":""}${cl.archived?" card-archived":""}`} onClick={onClick} onMouseEnter={onEnter}>
        <span className="list-card-emoji">{cl.emoji}</span>
        <div className="list-card-body">
          <div className="list-card-title serif">{cl.title}</div>
          {cl.description && <div className="list-card-desc">{cl.description}</div>}
        </div>
        <div className="list-card-right">
          <div className="progress-bar-bg" style={{width:72}}>
            <div className="progress-bar-fill" style={{width:`${pct}%`,background:accent}} />
          </div>
          <span className="progress-label">{done}/{total}</span>
          {cl.archived && <span className="card-archived-badge">archived</span>}
        </div>
      </div>
    );

    return (
      <div key={cl.id} className={`card${isFocused?" focused":""}${cl.archived?" card-archived":""}`} onClick={onClick} onMouseEnter={onEnter}>
        <div className="card-emoji">{cl.emoji}</div>
        <div className="card-title serif">{cl.title}</div>
        {cl.description && <div className="card-desc">{cl.description}</div>}
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{width:`${pct}%`,background:accent}} />
        </div>
        <div className="card-meta">
          <span className="progress-label">{done} / {total} complete</span>
          {cl.total_days && <span className="card-duration">~{cl.total_days} days</span>}
          {cl.archived && <span className="card-archived-badge">archived</span>}
        </div>
      </div>
    );
  };

  const wrapClass = view==="grid" ? "grid" : view==="list" ? "list-view" : "compact-view";

  return (
    <div className="app">
      <input ref={fileInputRef} type="file" accept=".json" style={{display:"none"}} onChange={handleFileChange} />
      <div className="header">
        <h1 className="serif">Checklists</h1>
        <div className="header-right">
          {importError && <span className="err-msg">{importError}</span>}
          <button className="btn btn-muted" onClick={()=>fileInputRef.current?.click()}>↑ Import</button>
          <button className="btn btn-dark" onClick={onNew}>+ New</button>
        </div>
      </div>

      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <div className="filter-tabs">
          {FILTERS.map(f=><button key={f} className={`filter-tab${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>)}
        </div>
        <div className="view-toggle">
          <span className="view-toggle-label">view</span>
          {VIEWS.map(v=><button key={v} className={`view-btn${view===v?" active":""}`} onClick={()=>setView(v)}>{v}</button>)}
        </div>
      </div>

      {showSearch && (
        <div className="search-bar">
          <input ref={searchRef} className="search-input" placeholder="Search checklists..." value={search}
            onChange={e=>setSearch(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Escape"){setShowSearch(false);setSearch("");} }} />
          <button className="search-clear" onClick={()=>{setShowSearch(false);setSearch("");}}>×</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          {search ? `No results for "${search}"` : filter==="archived" ? "No archived checklists." : <>No checklists yet. Press <kbd>n</kbd> to create one.</>}
        </div>
      ) : (
        <div className={wrapClass}>{filtered.map((cl,i)=>renderCard(cl,i))}</div>
      )}

      <KeyHintBar hints={showSearch ? [{key:"Esc",label:"close search"}] : [
        {key:"j/k",label:"nav"},{key:"Enter",label:"open"},{key:"/",label:"search"},
        {key:"n",label:"new"},{key:"i",label:"import"},{key:"v",label:`view:${view}`},
        {key:"Tab",label:`filter:${filter}`},{key:"?",label:"help"},
      ]} />
    </div>
  );
}

// ──── Detail ──────────────────────────────────────────────────────────────────

function Detail({ checklist, onChange, onBack, onEdit, onDelete, onArchive, onExport, modalOpen }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingTask, setAddingTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");

  const [showConfetti, setShowConfetti] = useState(false);
  const prevDone = useRef(null);

  const accent = checklist.color || "#D4522A";
  const { done, total } = getProgress(checklist);
  const pct = total ? (done/total)*100 : 0;

  useEffect(() => {
    if (prevDone.current !== null && prevDone.current < total && done === total && total > 0) {
      setShowConfetti(true);
      // Haptic feedback — supported on iOS Safari and Android, silently ignored elsewhere
      if (navigator.vibrate) {
        navigator.vibrate([80, 60, 80, 60, 120]);
      }
    }
    prevDone.current = done;
  }, [done, total]);

  const allItems = checklist.phases.flatMap(ph => [
    ...ph.tasks.map(t => ({type:"task",phaseId:ph.id,taskId:t.id})),
    {type:"add",phaseId:ph.id},
  ]);
  const [focusIdx, setFocusIdx] = useState(0);
  const focusRef = useRef(null);

  useEffect(() => { if (focusRef.current) focusRef.current.scrollIntoView({block:"nearest",behavior:"smooth"}); }, [focusIdx]);

  const toggleTask = (phaseId, taskId) => {
    onChange({...checklist, phases: checklist.phases.map(ph => ph.id!==phaseId ? ph : {
      ...ph, tasks: ph.tasks.map(t => t.id!==taskId ? t : {...t,done:!t.done})
    })});
  };

  const togglePhase = (phaseId) => {
    const phase = checklist.phases.find(ph => ph.id === phaseId);
    if (!phase) return;
    const allDone = phase.tasks.every(t => t.done);
    onChange({...checklist, phases: checklist.phases.map(ph => ph.id!==phaseId ? ph : {
      ...ph, tasks: ph.tasks.map(t => ({...t, done: !allDone}))
    })});
  };

  // ── Move task: within phase (up/down) or across phases (prev/next) ──
  const moveTask = (taskId, fromPhaseId, dir) => {
    const phases = checklist.phases;
    const phaseIdx = phases.findIndex(p => p.id === fromPhaseId);
    const phase = phases[phaseIdx];
    const taskIdx = phase.tasks.findIndex(t => t.id === taskId);
    const task = phase.tasks[taskIdx];

    let newPhases;
    if (dir === "up" || dir === "down") {
      const newIdx = dir === "up" ? taskIdx - 1 : taskIdx + 1;
      if (newIdx < 0 || newIdx >= phase.tasks.length) return;
      const tasks = [...phase.tasks];
      tasks.splice(taskIdx, 1);
      tasks.splice(newIdx, 0, task);
      newPhases = phases.map(p => p.id !== fromPhaseId ? p : {...p, tasks});
    } else {
      // Move to prev/next phase
      const toPhaseIdx = dir === "left" ? phaseIdx - 1 : phaseIdx + 1;
      if (toPhaseIdx < 0 || toPhaseIdx >= phases.length) return;
      const toPhase = phases[toPhaseIdx];
      newPhases = phases.map((p, i) => {
        if (p.id === fromPhaseId) return {...p, tasks: p.tasks.filter(t => t.id !== taskId)};
        if (i === toPhaseIdx) return {...p, tasks: dir === "left" ? [...p.tasks, task] : [task, ...p.tasks]};
        return p;
      });
    }
    onChange({...checklist, phases: newPhases});

    // After move, update focusIdx to follow the task
    setTimeout(() => {
      const newAllItems = newPhases.flatMap(ph => [
        ...ph.tasks.map(t => ({type:"task", phaseId:ph.id, taskId:t.id})),
        {type:"add", phaseId:ph.id},
      ]);
      const newIdx = newAllItems.findIndex(it => it.type==="task" && it.taskId===taskId);
      if (newIdx !== -1) setFocusIdx(newIdx);
    }, 0);
  };

  // ── Drag state ──
  const dragTask = useRef(null); // {taskId, phaseId}
  const [dragOver, setDragOver] = useState(null); // {taskId} or {phaseId, end:true}
  const [moveMode, setMoveMode] = useState(false);



  const commitNewTask = (phaseId) => {
    if (!newTaskText.trim()) { setAddingTask(null); setNewTaskText(""); return; }
    onChange({...checklist, phases: checklist.phases.map(ph => ph.id!==phaseId ? ph : {
      ...ph, tasks: [...ph.tasks, {id:uid(),text:newTaskText.trim(),done:false,subtasks:[],note:""}]
    })});
    setNewTaskText(""); setAddingTask(null);
  };

  useEffect(() => {
    const h = (e) => {
      if (modalOpen) return;
      if (document.activeElement.tagName==="INPUT"||document.activeElement.tagName==="TEXTAREA") return;
      const item = allItems[focusIdx];
      if (e.key==="j"||e.key==="ArrowDown") { e.preventDefault(); setFocusIdx(i=>Math.min(i+1,allItems.length-1)); }
      else if (e.key==="k"||e.key==="ArrowUp") { e.preventDefault(); setFocusIdx(i=>Math.max(i-1,0)); }
      else if ((e.key==="Enter"||e.key===" "||e.key==="x")&&item) {
        e.preventDefault();
        if (item.type==="task") toggleTask(item.phaseId,item.taskId);
        if (item.type==="add") setAddingTask(item.phaseId);
      }
      else if (e.key==="Escape"||e.key==="b") { e.preventDefault(); if(confirmDelete)setConfirmDelete(false); else onBack(); }
      else if (e.key==="e") { e.preventDefault(); onEdit(); }
      else if (e.key==="d") { e.preventDefault(); setConfirmDelete(true); }
      else if (e.key==="y"&&confirmDelete) { e.preventDefault(); onDelete(); }
      else if (e.key==="n"&&confirmDelete) { e.preventDefault(); setConfirmDelete(false); }
      else if (e.key==="P"&&item) { e.preventDefault(); togglePhase(item.phaseId); }
      else if (e.key==="J"&&item?.type==="task") { e.preventDefault(); moveTask(item.taskId,item.phaseId,"down"); }
      else if (e.key==="K"&&item?.type==="task") { e.preventDefault(); moveTask(item.taskId,item.phaseId,"up"); }
      else if (e.key==="H"&&item?.type==="task") { e.preventDefault(); moveTask(item.taskId,item.phaseId,"left"); }
      else if (e.key==="L"&&item?.type==="task") { e.preventDefault(); moveTask(item.taskId,item.phaseId,"right"); }
      else if (e.key==="a") { e.preventDefault(); onArchive(); }
      else if (e.key==="E") { e.preventDefault(); onExport(); }
      else if (e.key==="g") setFocusIdx(0);
      else if (e.key==="G") setFocusIdx(allItems.length-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [allItems, focusIdx, confirmDelete, modalOpen, onBack, onEdit, onDelete, onArchive, onExport, checklist]);

  return (
    <div className="app">
      {showConfetti && <Confetti onDone={()=>setShowConfetti(false)} />}

      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-title-row">
            <div className="detail-back-row">
              <button className="back-btn" onClick={onBack}>←</button>
              <h1 className="serif" style={{fontSize:"1.7rem",lineHeight:1}}>{checklist.emoji} {checklist.title}</h1>
            </div>
            <div className="detail-subtitle">{checklist.description || "checklist"}</div>
          </div>
          {confirmDelete ? (
            <div className="confirm-delete">
              Delete?&nbsp;
              <button className="confirm-btn yes" onClick={onDelete}>yes</button>
              <button className="confirm-btn" onClick={()=>setConfirmDelete(false)}>cancel</button>
            </div>
          ) : (
            <div className="detail-actions">
              <button className="action-btn" onClick={onEdit}>[edit]</button>
              <button className="action-btn" onClick={onArchive}>[{checklist.archived?"unarchive":"archive"}]</button>
              <button className="action-btn" onClick={onExport}>[export]</button>
              <button className="action-btn danger" onClick={()=>setConfirmDelete(true)}>[delete]</button>
            </div>
          )}
        </div>
        <div className="progress-label-large">{done} / {total} Complete{pct===100?" 🎉":""}</div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{width:`${pct}%`,background:accent}} />
        </div>
      </div>

      {checklist.phases.map(ph => (
        <div className="phase-section" key={ph.id}>
          <div className="phase-label">
            <span style={{color:accent}}>●</span>
            {ph.label} — {ph.title}{ph.duration?` · ${ph.duration}`:""}
          </div>
          <div className="tasks-list">
            {ph.tasks.map(task => {
              const flatIdx = allItems.findIndex(it=>it.type==="task"&&it.taskId===task.id);
              const isFocused = flatIdx===focusIdx;
              const isDragOver = dragOver?.taskId === task.id;
              const isDragging = dragTask.current?.taskId === task.id;
              return (
                <div key={task.id}>
                  {/* Drop zone above each task */}
                  <div
                    className={`phase-drop-zone${isDragOver?" drag-over":""}`}
                    onDragOver={e=>{e.preventDefault();setDragOver({taskId:task.id});}}
                    onDragLeave={()=>setDragOver(null)}
                    onDrop={e=>{
                      e.preventDefault();
                      if (!dragTask.current) return;
                      const {taskId:srcId, phaseId:srcPhase} = dragTask.current;
                      if (srcId===task.id) { setDragOver(null); return; }
                      // Build new phases with task moved before this task
                      const srcPh = checklist.phases.find(p=>p.id===srcPhase);
                      const movingTask = srcPh.tasks.find(t=>t.id===srcId);
                      let newPhases = checklist.phases.map(p => p.id===srcPhase ? {...p, tasks:p.tasks.filter(t=>t.id!==srcId)} : p);
                      newPhases = newPhases.map(p => p.id!==ph.id ? p : {
                        ...p, tasks: (() => {
                          const arr = [...p.tasks];
                          const insertIdx = arr.findIndex(t=>t.id===task.id);
                          arr.splice(insertIdx, 0, movingTask);
                          return arr;
                        })()
                      });
                      onChange({...checklist, phases: newPhases});
                      dragTask.current = null; setDragOver(null);
                    }}
                  />
                  <div
                    className={`task-row${isFocused?" focused":""}${isDragging?" dragging":""}`}
                    ref={isFocused?focusRef:null}
                    draggable="true"
                    onMouseEnter={()=>setFocusIdx(flatIdx)}
                    onDragStart={e=>{
                      dragTask.current={taskId:task.id,phaseId:ph.id};
                      e.dataTransfer.effectAllowed="move";
                    }}
                    onDragEnd={()=>{ dragTask.current=null; setDragOver(null); }}
                  >
                    <div className="task-row-main">
                      <span className="drag-handle" title="Drag to move">⠿</span>
                      <div className={`checkbox${task.done?" checked":""}`}
                        onClick={e=>{e.stopPropagation();setFocusIdx(flatIdx);toggleTask(ph.id,task.id);}}>
                        {task.done&&"✓"}
                      </div>
                      <div className="task-body">
                        <span className={`task-text${task.done?" done":""}`}
                          onClick={()=>{setFocusIdx(flatIdx);toggleTask(ph.id,task.id);}}>
                          {task.text}
                        </span>
                        {task.tag && <span className="tag" style={{marginLeft:8}}>{task.tag}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Drop zone at bottom of phase */}
            <div
              className={`phase-drop-zone${dragOver?.phaseId===ph.id&&dragOver?.end?" drag-over":""}`}
              onDragOver={e=>{e.preventDefault();setDragOver({phaseId:ph.id,end:true});}}
              onDragLeave={()=>setDragOver(null)}
              onDrop={e=>{
                e.preventDefault();
                if (!dragTask.current) return;
                const {taskId:srcId, phaseId:srcPhase} = dragTask.current;
                const srcPh = checklist.phases.find(p=>p.id===srcPhase);
                const movingTask = srcPh.tasks.find(t=>t.id===srcId);
                let newPhases = checklist.phases.map(p => p.id===srcPhase ? {...p, tasks:p.tasks.filter(t=>t.id!==srcId)} : p);
                newPhases = newPhases.map(p => p.id!==ph.id ? p : {...p, tasks:[...p.tasks, movingTask]});
                onChange({...checklist, phases: newPhases});
                dragTask.current=null; setDragOver(null);
              }}
            />

            {addingTask===ph.id ? (
              <div className="add-task-row">
                <input className="add-task-input" autoFocus placeholder="New task..."
                  value={newTaskText} onChange={e=>setNewTaskText(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")commitNewTask(ph.id);if(e.key==="Escape"){setAddingTask(null);setNewTaskText("");}}}
                  onBlur={()=>commitNewTask(ph.id)} />
              </div>
            ) : (() => {
              const addIdx = allItems.findIndex(it=>it.type==="add"&&it.phaseId===ph.id);
              const isAddFocused = addIdx===focusIdx;
              return (
                <button className="add-task-link"
                  ref={isAddFocused?focusRef:null}
                  style={isAddFocused?{color:"#D4522A",outline:"2px solid #D4522A",outlineOffset:"-2px"}:{}}
                  onClick={()=>{setFocusIdx(addIdx);setAddingTask(ph.id);}}
                  onMouseEnter={()=>setFocusIdx(addIdx)}>+ add task</button>
              );
            })()}
          </div>
        </div>
      ))}

      {checklist.total_days && (
        <div className="checklist-footer">~{checklist.total_days} DAYS TOTAL &nbsp;·&nbsp; {checklist.title.toUpperCase()} V1.0</div>
      )}

      <KeyHintBar hints={confirmDelete ? [
        {key:"y",label:"confirm delete"},{key:"n/Esc",label:"cancel"}
      ] : [
        {key:"j/k",label:"move"},{key:"J/K",label:"reorder"},{key:"H/L",label:"move phase"},
        {key:"x",label:"toggle"},{key:"P",label:"phase done"},{key:"e",label:"edit"},
        {key:"a",label:checklist.archived?"unarchive":"archive"},{key:"E",label:"export"},
        {key:"d",label:"delete"},{key:"b/Esc",label:"back"},{key:"?",label:"help"},
      ]} />
    </div>
  );
}

// ──── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  const [checklists, setChecklists] = useState(()=>loadData());
  const [view, setView] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [modal, setModal] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const persist = useCallback((next)=>{setChecklists(next);saveData(next);},[]);

  const handleSelect = (id) => { setActiveId(id); setView("detail"); };
  const handleBack = () => { setView("home"); setActiveId(null); };

  const handleImport = (items) => {
    const existing = new Set(checklists.map(c=>c.id));
    const deduped = items.map(item=>existing.has(item.id)?{...item,id:uid()}:item);
    persist([...checklists,...deduped]);
  };

  const handleSave = (data) => {
    if (modal==="new") persist([...checklists,data]);
    else { persist(checklists.map(cl=>cl.id===data.id?data:cl)); setActiveId(data.id); }
    setModal(null);
  };

  const handleChange = (updated) => persist(checklists.map(cl=>cl.id===updated.id?updated:cl));

  const handleDelete = () => {
    persist(checklists.filter(cl=>cl.id!==activeId));
    setView("home"); setActiveId(null);
  };

  const handleArchive = () => {
    persist(checklists.map(c=>c.id===activeId?{...c,archived:!c.archived}:c));
  };

  const handleExport = () => {
    const cl = checklists.find(c=>c.id===activeId); if(!cl) return;
    const blob = new Blob([JSON.stringify(cl,null,2)],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${cl.title.toLowerCase().replace(/\s+/g,"-")}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  useEffect(()=>{
    const h = (e) => {
      if (e.key==="?"&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="TEXTAREA") {
        setShowHelp(v=>!v);
      }
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[]);

  const active = checklists.find(cl=>cl.id===activeId);

  return (
    <>
      <style>{styles}</style>
      {view==="home"
        ? <Home checklists={checklists} onSelect={handleSelect} onNew={()=>setModal("new")} onImport={handleImport} />
        : active
          ? <Detail checklist={active} onChange={handleChange} onBack={handleBack}
              onEdit={()=>setModal("edit")} onDelete={handleDelete}
              onArchive={handleArchive} onExport={handleExport}
              modalOpen={!!modal||showHelp} />
          : null}
      {modal && <Modal initial={modal==="edit"?active:null} onSave={handleSave} onClose={()=>setModal(null)} />}
      {showHelp && <HelpOverlay onClose={()=>setShowHelp(false)} />}
    </>
  );
}
