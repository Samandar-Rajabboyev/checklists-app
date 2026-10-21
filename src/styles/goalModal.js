// Styles for the goal editor (components/Modal.jsx). Scoped under `gm-`;
// colors come from the scheme CSS variables (constants.js#applyScheme).
export const goalModalStyles = `
  .gm-overlay { position:fixed; inset:0; z-index:100; background:var(--overlay-bg); display:flex; align-items:flex-start; justify-content:center; padding:6vh 24px 24px; animation:gm-fade .12s ease-out; }
  .gm { position:relative; width:100%; max-width:680px; max-height:88vh; display:flex; flex-direction:column; background:var(--bg); outline:1px solid var(--border); border-radius:14px; box-shadow:0 24px 64px rgba(0,0,0,.35); font-family:'Inter',sans-serif; color:var(--text); animation:gm-rise .16s ease-out; }
  .gm:focus { outline:1px solid var(--border); }
  .gm-body { flex:1; overflow-y:auto; overscroll-behavior:contain; padding:22px 28px 8px; }
  .gm button { font-family:inherit; }
  .gm button:disabled { opacity:.3; cursor:default; }

  .gm-banner { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:14px; padding:8px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); font-size:.72rem; color:var(--text-muted); }
  .gm-link { background:none; border:none; color:var(--text); font-size:.72rem; text-decoration:underline; cursor:pointer; padding:0; }

  /* Emoji + title */
  .gm-head-row { display:flex; align-items:center; gap:12px; }
  .gm-emoji-wrap { position:relative; flex-shrink:0; }
  .gm-emoji-btn { width:52px; height:52px; display:flex; align-items:center; justify-content:center; font-size:1.7rem; line-height:1; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; cursor:pointer; }
  .gm-emoji-btn:hover { background:var(--bg-hover); }
  .gm-emoji-pop { position:absolute; top:58px; left:0; z-index:5; width:288px; display:grid; grid-template-columns:repeat(8,1fr); gap:2px; padding:8px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; box-shadow:0 12px 32px rgba(0,0,0,.3); }
  .gm-emoji-pop button { background:none; border:none; border-radius:7px; padding:5px 0; font-size:1.15rem; line-height:1; cursor:pointer; }
  .gm-emoji-pop button:hover, .gm-emoji-pop button.on { background:var(--bg-hover); }
  .gm-emoji-pop input { grid-column:1/-1; margin-top:6px; }
  .gm-title { flex:1; min-width:0; background:none; border:none; outline:none; padding:6px 0; color:var(--text); font-family:inherit; font-size:1.55rem; font-weight:700; letter-spacing:-.02em; }
  .gm-title::placeholder { color:var(--text-placeholder); }
  .gm-close { align-self:flex-start; font-size:1.2rem !important; width:32px !important; height:32px !important; }
  .gm-error { margin:4px 0 0 64px; font-size:.72rem; color:#D4522A; }
  .gm-shake { animation:gm-shake .32s; }

  /* Chips (templates, categories) */
  .gm-chips { display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:14px; }
  .gm-chips-tight { margin-top:0; }
  .gm-chip-label { margin-right:2px; font-size:.68rem; color:var(--text-muted); }
  .gm-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border); border-radius:999px; color:var(--text); font-size:.72rem; cursor:pointer; transition:border-color .1s, background .1s; }
  .gm-chip:hover { border-color:var(--text-muted); }
  .gm-chip.on { background:var(--border-strong); border-color:var(--border-strong); color:var(--bg); }

  /* Details */
  .gm-details-toggle { width:100%; display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:14px; padding:4px 0; background:none; border:none; color:var(--text-muted); font-size:.72rem; text-align:left; cursor:pointer; }
  .gm-details-toggle:hover .gm-pill { border-color:var(--text-muted); }
  .gm-caret { width:12px; font-size:.7rem; }
  .gm-pill { display:inline-flex; align-items:center; gap:5px; padding:2px 9px; border:1px solid var(--border); border-radius:999px; font-size:.68rem; color:var(--text); }
  .gm-pill-muted { color:var(--text-muted); border-style:dashed; }
  .gm-dot { width:9px; height:9px; border-radius:50%; }
  .gm-details { display:grid; gap:16px; margin-top:10px; padding:16px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; }
  .gm-field label { display:block; margin-bottom:6px; font-size:.62rem; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:var(--text-muted); }
  .gm-input { width:100%; box-sizing:border-box; padding:8px 10px; background:var(--bg); border:1px solid var(--border); border-radius:8px; outline:none; color:var(--text); font-family:inherit; font-size:.8rem; }
  .gm-input:focus { border-color:var(--text-muted); }
  textarea.gm-input { resize:none; min-height:58px; line-height:1.5; overflow:hidden; }
  input[type=date].gm-input { color-scheme:light dark; }
  .gm-row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .gm-suffix { position:relative; }
  .gm-suffix span { position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:.72rem; color:var(--text-muted); pointer-events:none; }
  .gm-hint { margin-top:5px; font-size:.66rem; color:var(--text-muted); }
  .gm-swatches { display:flex; gap:10px; }
  .gm-swatch { width:24px; height:24px; padding:0; border:none; border-radius:50%; cursor:pointer; outline:2px solid transparent; outline-offset:2px; }
  .gm-swatch.on { outline-color:var(--text); }

  /* Phases */
  .gm-section-label { display:flex; justify-content:space-between; margin:22px 0 8px; font-size:.62rem; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:var(--text-muted); }
  .gm-phase { margin-bottom:10px; padding:8px 10px 6px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; }
  .gm-phase:focus-within { border-color:var(--text-muted); }
  .gm-phase-head { display:flex; align-items:center; gap:8px; padding:0 2px 0 4px; }
  .gm-phase-label { width:64px; flex-shrink:0; padding:4px 0; background:none; border:none; outline:none; color:var(--text-muted); font-family:inherit; font-size:.62rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
  .gm-phase-label::placeholder { color:var(--text-muted); }
  .gm-phase-label:focus { color:var(--text); }
  .gm-phase-title { flex:1; min-width:0; padding:5px 0; background:none; border:none; outline:none; color:var(--text); font-family:inherit; font-size:.92rem; font-weight:600; }
  .gm-phase-title::placeholder { color:var(--text-placeholder); font-weight:500; }
  .gm-phase-dur { width:84px; flex-shrink:0; padding:3px 6px; background:none; border:1px solid transparent; border-radius:6px; outline:none; color:var(--text-muted); font-family:inherit; font-size:.7rem; text-align:right; }
  .gm-phase-dur:hover, .gm-phase-dur:focus { border-color:var(--border); color:var(--text); }
  .gm-phase-dur::placeholder { color:var(--text-placeholder); }
  .gm-phase-actions { display:flex; gap:2px; opacity:0; transition:opacity .1s; }
  .gm-phase:hover .gm-phase-actions, .gm-phase:focus-within .gm-phase-actions { opacity:1; }
  .gm-icon-btn { width:26px; height:26px; display:inline-flex; align-items:center; justify-content:center; padding:0; background:none; border:none; border-radius:7px; color:var(--text-muted); font-size:.82rem; cursor:pointer; }
  .gm-icon-btn:hover:not(:disabled) { background:var(--bg-hover); color:var(--text); }
  .gm-armed { width:auto; padding:0 9px; color:#D4522A !important; font-size:.68rem; font-weight:600; }

  /* Tasks */
  .gm-tasks { margin-top:2px; }
  .gm-task { position:relative; display:flex; align-items:center; gap:6px; padding:0 4px 0 0; border-radius:7px; }
  .gm-task:hover, .gm-task:focus-within { background:var(--bg-hover); }
  .gm-task.drop-before::before { content:''; position:absolute; left:4px; right:4px; top:-1px; height:2px; border-radius:2px; background:var(--accent); }
  .gm-handle { width:14px; flex-shrink:0; text-align:center; font-size:.72rem; color:var(--text-muted); cursor:grab; user-select:none; opacity:0; }
  .gm-task:hover .gm-handle { opacity:.7; }
  .gm-check { width:16px; height:16px; flex-shrink:0; display:flex; align-items:center; justify-content:center; padding:0; background:none; border:1.5px solid var(--text-muted); border-radius:5px; color:var(--bg); font-size:.62rem; line-height:1; cursor:pointer; opacity:.55; }
  .gm-check:hover { opacity:1; }
  .gm-check.on { background:var(--text-muted); opacity:1; }
  .gm-task-input { flex:1; min-width:0; padding:7px 0; background:none; border:none; outline:none; color:var(--text); font-family:inherit; font-size:.82rem; }
  .gm-task-input::placeholder { color:var(--text-placeholder); }
  .gm-task.done .gm-task-input { color:var(--text-muted); text-decoration:line-through; }
  .gm-add .gm-task-input::placeholder { color:var(--text-muted); }
  .gm-plus { width:36px; flex-shrink:0; text-align:right; padding-right:2px; color:var(--text-muted); font-size:.9rem; }
  .gm-meta { display:flex; align-items:center; gap:3px; flex-shrink:0; }
  .gm-prio { min-width:20px; height:20px; display:inline-flex; align-items:center; justify-content:center; padding:0 5px; background:none; border:1.5px solid; border-radius:999px; font-size:.6rem; font-weight:700; cursor:pointer; }
  .gm-due { position:relative; padding:3px 7px; border-radius:6px; font-size:.68rem; color:var(--text); white-space:nowrap; cursor:pointer; }
  .gm-due:hover { background:var(--bg-card); }
  .gm-due input { position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; border:none; padding:0; }
  .gm-mini { width:18px !important; height:18px !important; font-size:.72rem !important; }
  /* Row controls stay out of the way until the row is hovered/focused. */
  .gm-prio.none, .gm-due.empty, .gm-del { opacity:0; transition:opacity .1s; }
  .gm-task:hover .gm-prio.none, .gm-task:focus-within .gm-prio.none,
  .gm-task:hover .gm-due.empty, .gm-task:focus-within .gm-due.empty { opacity:.6; }
  .gm-task:hover .gm-del, .gm-task:focus-within .gm-del { opacity:1; }

  .gm-add-phase { width:100%; padding:11px; background:none; border:1px dashed var(--border); border-radius:12px; color:var(--text-muted); font-size:.74rem; cursor:pointer; }
  .gm-add-phase:hover { border-color:var(--text-muted); color:var(--text); }

  .gm-hints { display:flex; flex-wrap:wrap; gap:6px 16px; margin:14px 0 12px; font-size:.64rem; color:var(--text-muted); }
  .gm kbd { display:inline-block; margin-right:3px; padding:0 4px; background:var(--modal-kbd-bg); border:1px solid var(--modal-kbd-border); border-radius:4px; color:var(--text); font-family:inherit; font-size:.62rem; line-height:1.5; }

  /* Footer */
  .gm-foot { display:flex; align-items:center; gap:8px; padding:12px 20px 12px 28px; border-top:1px solid var(--border); }
  .gm-foot-msg { margin-right:auto; font-size:.7rem; color:var(--text-muted); }
  .gm-saved { opacity:.7; }
  .gm-btn { display:inline-flex; align-items:center; gap:8px; padding:8px 14px; background:none; border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:.74rem; font-weight:500; cursor:pointer; white-space:nowrap; }
  .gm-btn:hover { border-color:var(--text-muted); }
  .gm-btn-primary { background:var(--border-strong); border-color:var(--border-strong); color:var(--bg); font-weight:600; }
  .gm-btn-primary:hover { opacity:.88; }
  .gm-btn-primary kbd, .gm-btn-danger kbd { background:transparent; border-color:currentColor; color:inherit; opacity:.6; margin:0; }
  .gm-btn-danger { background:#D4522A; border-color:#D4522A; color:#fff; font-weight:600; }

  @keyframes gm-fade { from { opacity:0; } }
  @keyframes gm-rise { from { opacity:0; transform:translateY(8px) scale(.99); } }
  @keyframes gm-shake { 20%,60% { transform:translateX(-5px); } 40%,80% { transform:translateX(5px); } }
  @media (prefers-reduced-motion:reduce) { .gm-overlay, .gm, .gm-shake { animation:none; } }

  /* Touch: there is no hover, so keep row controls visible (faintly). */
  @media (hover:none) {
    .gm-phase-actions, .gm-del { opacity:1; }
    .gm-prio.none, .gm-due.empty { opacity:.5; }
    .gm-handle { display:none; }
  }

  /* Phones: bottom sheet, bigger targets, 16px inputs (no iOS zoom). */
  @media (max-width:600px) {
    .gm-overlay { padding:0; align-items:flex-end; }
    .gm { max-width:100%; max-height:94vh; border-radius:16px 16px 0 0; }
    .gm-body { padding:18px 16px 8px; }
    .gm-foot { padding:10px 16px calc(10px + env(safe-area-inset-bottom)); }
    .gm-title { font-size:1.3rem; }
    .gm-task-input, .gm-phase-title, .gm-input { font-size:16px; }
    .gm-task-input { padding:10px 0; }
    .gm-row2 { grid-template-columns:1fr; }
    .gm-hints, .gm-btn kbd, .gm-saved { display:none; }
    .gm-phase-dur { width:64px; }
    .gm-emoji-pop { width:min(288px, calc(100vw - 48px)); }
  }
`;
