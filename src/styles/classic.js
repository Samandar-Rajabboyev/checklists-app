// ──── Default theme CSS ─────────────────────────────────────────────────────
// Formerly two modes (classic/Notion-style + modern); consolidated into one
// minimal default per the product's minimalist-UI direction. "Plain" mode
// remains a separate power-user mode (see plain.js) and is unaffected.

export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; padding-bottom: 24px; }
  .serif { font-family: 'Inter', sans-serif; font-weight: 700; letter-spacing: -0.03em; }
  .app { max-width: 680px; margin: 0 auto; padding: 0 32px 80px; }
  html { -webkit-text-size-adjust: 100%; }
  body { overflow-x: hidden; }

  /* Topbar */
  .topbar { position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between; height:48px; padding:0 24px; background:var(--bg); border-bottom:1px solid var(--border); margin:0 -24px 28px; gap:0; }
  .topbar-brand { display:flex; align-items:center; gap:8px; min-width:0; flex-shrink:0; margin-right:24px; }
  .topbar-logo { font-size:1rem; color:var(--accent); flex-shrink:0; }
  .topbar-title { font-family:'Inter',sans-serif; font-size:0.95rem; font-weight:700; letter-spacing:-0.02em; line-height:1; white-space:nowrap; }
  .topbar-nav { display:flex; align-items:stretch; height:100%; flex:1; gap:0; }
  .topbar-nav-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; color:var(--text-muted); cursor:pointer; padding:0 16px; border-bottom:2px solid transparent; letter-spacing:0; transition:color 0.1s; white-space:nowrap; }
  .topbar-nav-btn:hover { color:var(--text); }
  .topbar-nav-btn.active { color:var(--text); border-bottom-color:var(--accent); }
  .topbar-actions { display:flex; align-items:center; gap:6px; flex-shrink:0; margin-left:16px; }
  .topbar-views { display:flex; align-items:center; gap:1px; background:var(--border); padding:1px; }
  .topbar-view-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.85rem; cursor:pointer; color:var(--text-muted); padding:3px 7px; line-height:1; }
  .topbar-view-btn:hover { color:var(--text); }
  .topbar-view-btn.active { background:var(--bg); color:var(--text); }
  .topbar-divider { width:1px; height:20px; background:var(--border); margin:0 4px; flex-shrink:0; }
  .topbar-import-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; color:var(--text-muted); cursor:pointer; padding:5px 8px; letter-spacing:0; }
  .topbar-import-btn:hover { color:var(--text); }
  .topbar-new-btn { background:var(--border-strong); color:var(--bg); border:none; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:600; cursor:pointer; padding:6px 13px; letter-spacing:0; white-space:nowrap; border-radius:6px; }
  .topbar-new-btn:hover { opacity:0.82; }

  /* Topbar — narrow screens: wrap into two rows instead of overflowing.
     Row 1: brand + new button. Row 2: nav tabs (scrollable) + the rest
     of the actions (also scrollable), so nothing is ever clipped
     off-screen with no way to reach it. */
  @media (max-width:760px) {
    .topbar { flex-wrap:wrap; height:auto; min-height:48px; padding:8px 16px; row-gap:8px; margin:0 -16px 20px; }
    .topbar-brand { margin-right:auto; }
    .topbar-nav { order:3; flex:1 1 100%; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
    .topbar-nav::-webkit-scrollbar { display:none; }
    .topbar-nav-btn { padding:6px 12px; flex-shrink:0; }
    .topbar-actions { margin-left:0; flex-wrap:wrap; flex-shrink:1; max-width:100%; justify-content:flex-end; row-gap:8px; }
    .topbar-new-btn { padding:8px 14px; }
  }
  @media (max-width:480px) {
    .app { padding:0 14px 60px; }
    .topbar { padding:8px 12px; margin:0 -14px 18px; }
    .topbar-title { font-size:0.92rem; }
    .topbar-actions { gap:5px; }
    .topbar-import-btn { padding:5px 6px; }
    .topbar-divider { margin:0 2px; }
  }

  /* Buttons */
  .btn { border:none; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; cursor:pointer; padding:6px 12px; letter-spacing:0; border-radius:5px; }
  .btn-dark { background:var(--text); color:var(--bg); }
  .btn-dark:hover { opacity:0.75; }
  .btn-muted { background:none; border:1px solid transparent; color:var(--text-muted); }
  .btn-muted:hover { color:var(--text); border-color:transparent; background:var(--bg-hover); }

  /* Scheme picker */
  .scheme-picker { display:flex; gap:5px; align-items:center; }

  /* UI mode toggle */
  .mode-toggle-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; color:var(--text-muted); cursor:pointer; padding:4px 10px; letter-spacing:0; border-radius:5px; }
  .mode-toggle-btn:hover { background:var(--bg-hover); color:var(--text); border-color:transparent; }
  .scheme-dot { width:12px; height:12px; cursor:pointer; border-radius:50%; flex-shrink:0; transition:transform 0.1s; }
  .scheme-dot:hover { transform:scale(1.2); }
  .scheme-dot.active { outline:2px solid var(--text); outline-offset:2px; }

  /* Search bar on home */
  .search-bar { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
  .search-input { flex:1; background:var(--bg-card); border:1px solid var(--border); font-family:'Inter',sans-serif; font-size:0.82rem; padding:8px 12px; color:var(--text); outline:none; border-radius:6px; }
  .search-input:focus { border-color:var(--text-muted); }
  .search-clear { background:none; border:none; font-size:1rem; cursor:pointer; color:var(--text-muted); padding:0 4px; }
  .search-clear:hover { color:var(--accent); }

  /* Filter/view (kept for compat, now used via topbar classes) */
  .filter-tab { display:none; }
  .view-btn { display:none; }

  /* Cards — grid: clean floating rectangles, no border */
  .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  @media (max-width:600px) { .grid { grid-template-columns:1fr; } }
  .card { background:var(--bg-card); border:none; border-radius:10px; padding:20px; cursor:pointer; transition:background 0.12s; }
  .card:hover { background:var(--bg-hover); }
  .card.focused { background:var(--bg-hover); outline:1.5px solid var(--text-muted); outline-offset:0; }
  .card-archived { opacity:0.5; }
  .card-emoji { font-size:1.2rem; margin-bottom:10px; }
  .card-title { font-size:0.95rem; font-weight:600; letter-spacing:-0.01em; margin-bottom:4px; }
  .card-desc { color:var(--text-muted); font-size:0.72rem; line-height:1.5; margin-bottom:14px; }
  .card-meta { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  .card-duration { font-size:0.66rem; color:var(--text-muted); }
  .card-archived-badge { font-size:0.6rem; color:var(--text-muted); border:1px solid var(--border); padding:1px 5px; letter-spacing:0.05em; }
  .card-category-badge { font-size:0.58rem; color:var(--text-muted); border:1px solid var(--border); padding:1px 5px; letter-spacing:0.06em; }
  .card-status-badge { font-size:0.58rem; padding:1px 5px; letter-spacing:0.06em; border:1px solid transparent; }
  .card-status-paused { color:var(--text-muted); border-color:var(--border); background:var(--bg-hover); }
  .card-status-done { color:var(--bg); background:var(--accent); }
  .list-card-title .card-category-badge, .list-card-title .card-status-badge { margin-left:8px; vertical-align:middle; font-family:'Inter',sans-serif; }

  /* Cards — list */
  .list-view { display:flex; flex-direction:column; gap:2px; }
  .list-card { background:transparent; border:none; border-radius:8px; padding:12px 14px; cursor:pointer; display:flex; align-items:center; gap:12px; transition:background 0.1s; }
  .list-card:hover { background:var(--bg-hover); outline:none; }
  .list-card.focused { background:var(--bg-hover); outline:1.5px solid var(--text-muted); }
  .list-card-emoji { font-size:1.1rem; flex-shrink:0; }
  .list-card-body { flex:1; min-width:0; }
  .list-card-title { font-size:0.85rem; font-weight:500; }
  .list-card-desc { font-size:0.68rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .list-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:3px; flex-shrink:0; }

  /* Cards — compact */
  .compact-view { display:flex; flex-direction:column; border:none; background:none; gap:0; }
  .compact-card { background:transparent; border:none; border-radius:6px; padding:8px 10px; cursor:pointer; display:flex; align-items:center; gap:10px; transition:background 0.1s; }
  .compact-card:hover { background:var(--bg-hover); outline:none; }
  .compact-card.focused { background:var(--bg-hover); outline:1.5px solid var(--text-muted); }
  .compact-card-emoji { font-size:0.95rem; flex-shrink:0; }
  .compact-card-title { font-size:0.78rem; font-weight:500; flex:1; }
  .compact-progress-text { font-size:0.63rem; color:var(--text-muted); flex-shrink:0; }

  /* Progress */
  .progress-bar-bg { height:2px; background:var(--border); margin-bottom:5px; border-radius:99px; }
  .progress-bar-fill { height:100%; border-radius:99px; }
  .progress-label { font-size:0.66rem; color:var(--text-muted); }
  .progress-label-large { font-size:0.7rem; color:var(--text-muted); letter-spacing:0; margin-bottom:8px; text-transform:none; font-weight:500; }

  /* Detail header */
  .detail-header { padding:42px 0 16px; border-bottom:none; margin-bottom:20px; }
  .detail-header-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
  .detail-title-row { display:flex; flex-direction:column; gap:5px; }
  .detail-title-row h1 { font-size:1.8rem; font-weight:700; letter-spacing:-0.03em; }
  .detail-back-row { display:flex; align-items:center; gap:10px; }
  .detail-subtitle { font-size:0.73rem; color:var(--text-muted); letter-spacing:0; text-transform:none; }
  .back-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.85rem; font-weight:500; cursor:pointer; color:var(--text-muted); padding:0; line-height:1; }
  .back-btn:hover { color:var(--text); }
  .detail-actions { display:flex; gap:10px; flex-wrap:wrap; }
  .action-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; cursor:pointer; color:var(--text-muted); padding:0; }
  .action-btn:hover { color:var(--text); }
  .action-btn.danger:hover { color:var(--accent); }
  .confirm-delete { font-family:'Inter',sans-serif; font-size:0.7rem; color:var(--accent); display:flex; align-items:center; gap:8px; }
  .confirm-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.7rem; cursor:pointer; color:var(--text-muted); text-decoration:underline; padding:0; }
  .confirm-btn:hover { color:var(--text); }
  .confirm-btn.yes { color:var(--accent); }

  /* Phase section — quiet label, no background bar */
  .phase-section { margin-bottom:32px; }
  .phase-label { display:inline-flex; align-items:center; gap:6px; background:none; color:var(--text-muted); font-family:'Inter',sans-serif; font-size:0.68rem; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; padding:0 0 10px; margin-bottom:2px; border-bottom:none; cursor:pointer; user-select:none; }
  .phase-label:hover { opacity:0.65; }
  .phase-collapse-icon { font-size:0.5rem; opacity:0.6; }
  .phase-done-summary { font-family:'Inter',sans-serif; font-size:0.7rem; color:var(--text-muted); padding:8px 0; margin-bottom:0; }
  .phase-label-focused { background:transparent !important; color:var(--text) !important; opacity:1 !important; border-bottom:1px solid var(--accent) !important; }
  .phase-label-focused .phase-collapse-icon { opacity: 1 !important; }
  .phase-label-search { outline: 2px solid var(--accent); outline-offset: -2px; }
  .phase-done-summary-focused { color: var(--text) !important; }

  /* Task list — pure rows, ultra minimal */
  .tasks-list { border:none; background:none; }
  .task-row { display:flex; flex-direction:column; padding:9px 0; border-bottom:1px solid var(--border); cursor:pointer; background:transparent; border-radius:0; position:relative; transition:none; }
  .task-row:last-child { border-bottom:none; }
  .task-row:hover { background:transparent; }
  .task-row.focused { background:transparent; outline:none; }
  .task-row.focused .task-text { color:var(--text); }
  .task-row.focused::before { content:'›'; position:absolute; left:-14px; color:var(--accent); font-size:1rem; line-height:1; margin-top:1px; }
  .task-row.selected { background:transparent; outline:none; }
  .task-row.selected .task-text { opacity:0.6; }
  .task-row.dragging { opacity:0.35; }
  .task-row.search-match { background:transparent; border-left:none; padding-left:0; }
  .task-row.search-match .task-text { text-decoration-line:underline; text-decoration-color:var(--accent); text-decoration-thickness:1px; text-underline-offset:3px; }
  .task-row.search-current { background:transparent; border-left:none; padding-left:0; }
  .task-row.search-current::before { content:'›'; position:absolute; left:-14px; color:var(--accent); font-size:1rem; line-height:1.5; }
  .task-row.search-current .task-text { text-decoration-line:underline; text-decoration-color:var(--accent); text-decoration-thickness:2px; text-underline-offset:3px; color:var(--text); }
  .task-row-main { display:flex; align-items:center; gap:11px; }
  .checkbox { width:14px; height:14px; border:1.5px solid var(--text-muted); border-radius:4px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:9px; color:var(--bg); cursor:pointer; }
  .checkbox.checked { background:var(--accent); border-color:var(--accent); border-radius:4px; }
  .task-body { flex:1; min-width:0; }
  .task-text { font-family:'Inter',sans-serif; font-size:0.82rem; font-weight:400; line-height:1.5; }
  .task-text.done { text-decoration:line-through; color:var(--text-muted); opacity:0.6; }
  .tag { font-family:'Inter',sans-serif; font-size:0.6rem; font-weight:500; letter-spacing:0.05em; padding:1px 5px; border:1px solid var(--border); border-radius:3px; color:var(--text-muted); white-space:nowrap; text-transform:uppercase; margin-left:8px; }

  /* Task quick-edit (priority + due date) */
  .task-quick-edit { display:flex; align-items:center; gap:6px; flex-shrink:0; margin-left:8px; }
  .priority-dot-sm { width:17px; height:17px; border-radius:50%; border:1.5px solid var(--border); background:var(--bg); font-family:'Inter',sans-serif; font-size:0.52rem; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1; flex-shrink:0; }
  .priority-dot-sm:hover { opacity:0.7; }
  .task-due-badge { position:relative; font-size:0.6rem; color:var(--text-placeholder); border:1px solid var(--border); padding:2px 6px; cursor:pointer; white-space:nowrap; }
  .task-due-badge.set { color:var(--text-muted); border-color:var(--text-muted); }
  .task-due-badge:hover { color:var(--text); border-color:var(--text-muted); }
  .task-due-badge input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; }

  /* Add task */
  .add-task-row { padding:6px 0; border-top:none; background:transparent; }
  .add-task-input { width:100%; border:none; background:transparent; font-family:'Inter',sans-serif; font-size:0.82rem; color:var(--text); outline:none; }
  .add-task-input::placeholder { color:var(--text-placeholder); }
  .add-task-link { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; color:var(--text-muted); cursor:pointer; padding:8px 0; display:block; }
  .add-task-link:hover { color:var(--text); }
  .add-task-link.focused { color:var(--text); outline:none; }

  /* Floating search */
  .detail-search { position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:80; background:var(--bg-card); border:none; outline:1px solid var(--border); border-radius:8px; display:flex; align-items:center; gap:8px; padding:8px 14px; width:360px; max-width:90vw; box-shadow:0 4px 24px rgba(0,0,0,0.18); }
  .detail-search input { flex:1; border:none; background:transparent; font-family:'Inter',sans-serif; font-size:0.85rem; color:var(--text); outline:none; }
  .detail-search input::placeholder { color:var(--text-placeholder); }
  .detail-search-icon { color:var(--text-muted); font-size:0.8rem; flex-shrink:0; }
  .detail-search-info { font-family:'Inter',sans-serif; font-size:0.64rem; color:var(--text-muted); white-space:nowrap; flex-shrink:0; }
  .detail-search-close { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:0; line-height:1; flex-shrink:0; }
  .detail-search-close:hover { color:var(--text); }

  /* Detail header, task rows & touch targets — narrow screens */
  @media (max-width:760px) {
    .detail-header { padding:20px 0 16px; }
    .detail-header-top { flex-direction:column; gap:12px; align-items:stretch; }
    .detail-title-row h1 { font-size:1.4rem !important; }
    .detail-actions { gap:14px; }
    .task-row-main { flex-wrap:wrap; row-gap:8px; }
    .task-quick-edit { margin-left:0; flex-basis:100%; padding-left:26px; }
    .detail-search { top:10px; width:92vw; padding:8px 10px; }
  }
  @media (max-width:480px) {
    .detail-header-top h1 { font-size:1.25rem !important; }
    .detail-actions { gap:12px; row-gap:8px; }
  }

  /* Touch target sizing — comfortable tap areas on touch-capable screens,
     without inflating the dense desktop/keyboard-driven layout. Applied
     under the same width breakpoint as the rest of the mobile overrides
     rather than via a hover/pointer media feature, since tablets with a
     mouse should still get the same breakpoint-driven layout changes. */
  @media (max-width:760px) {
    .checkbox { width:28px; height:28px; font-size:15px; }
    .priority-dot-sm { width:28px; height:28px; font-size:0.7rem; }
    .task-due-badge { padding:8px 10px; font-size:0.68rem; }
    .remove-btn { padding:9px; font-size:1rem; }
    .checkin-del { padding:8px; font-size:1rem; }
    .back-btn { font-size:1.3rem; padding:8px; margin:-8px; }
    .detail-search-close { padding:8px; font-size:1.3rem; margin:-8px; }
    .search-clear { padding:8px; font-size:1.3rem; }
    .topbar-view-btn { padding:8px 10px; font-size:1rem; }
    .scheme-dot { width:20px; height:20px; }
    .mode-toggle-btn { padding:8px 12px; }
    .add-task-link { padding:13px; }
    .phase-label { padding:10px 11px; }
  }

  /* Modal */
  .modal-overlay { position:fixed; inset:0; background:var(--overlay-bg); display:flex; align-items:center; justify-content:center; z-index:100; padding:24px; }
  .modal { background:var(--bg); border:none; outline:1px solid var(--border); border-radius:12px; width:100%; max-width:600px; max-height:85vh; overflow-y:auto; padding:28px; }
  .modal-title { font-size:1.3rem; font-weight:700; letter-spacing:-0.02em; margin-bottom:20px; }
  .field { margin-bottom:13px; }
  .field label { display:block; font-family:'Inter',sans-serif; font-size:0.65rem; font-weight:600; color:var(--text-muted); letter-spacing:0.04em; text-transform:uppercase; margin-bottom:4px; }
  .field input, .field textarea { width:100%; background:var(--bg-card); border:1px solid var(--border); border-radius:5px; font-family:'Inter',sans-serif; font-size:0.8rem; color:var(--text); padding:6px 9px; outline:none; }
  .field input:focus, .field textarea:focus { border-color:var(--text-muted); }
  .field textarea { resize:vertical; min-height:52px; }
  .color-swatches { display:flex; gap:7px; margin-top:4px; }
  .swatch { width:21px; height:21px; cursor:pointer; border:2px solid transparent; }
  .swatch.selected { border-color:var(--border-strong); }

  /* Category picker */
  .category-picker { display:flex; gap:6px; flex-wrap:wrap; margin-top:4px; }
  .category-btn { background:var(--bg-card); border:1px solid var(--border); color:var(--text-muted); font-family:'Inter',sans-serif; font-size:0.68rem; padding:5px 11px; cursor:pointer; letter-spacing:0.02em; border-radius:5px; }
  .category-btn:hover { color:var(--text); border-color:var(--text-muted); }
  .category-btn.selected { background:var(--border-strong); color:var(--bg); border-color:var(--border-strong); }

  /* Template quick-start picker */
  .template-picker { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:4px; }
  @media (max-width:500px) { .template-picker { grid-template-columns:1fr; } }
  .template-btn { display:flex; align-items:center; gap:8px; background:var(--bg-card); border:1px solid var(--border); border-radius:6px; color:var(--text); font-family:'Inter',sans-serif; font-size:0.72rem; padding:10px 12px; cursor:pointer; text-align:left; }
  .template-btn:hover { border-color:var(--accent); background:var(--bg-hover); }
  .template-btn-emoji { font-size:1rem; flex-shrink:0; }

  .modal-phases { margin-top:16px; }
  .modal-phase { border:1px solid var(--border); border-radius:7px; background:var(--bg-card); padding:11px; margin-bottom:9px; }
  .modal-phase-header { display:grid; grid-template-columns:1fr 1fr 76px auto; gap:5px; margin-bottom:7px; align-items:start; }
  .modal-phase-header input { background:var(--bg); border:1px solid var(--border); border-radius:4px; font-family:'Inter',sans-serif; font-size:0.7rem; padding:4px 6px; color:var(--text); outline:none; width:100%; }
  .phase-task-row { display:flex; gap:5px; align-items:center; margin-bottom:5px; }
  .phase-task-row input { flex:1; background:var(--bg); border:1px solid var(--border); border-radius:4px; font-family:'Inter',sans-serif; font-size:0.7rem; padding:4px 6px; color:var(--text); outline:none; }
  .priority-dot { flex-shrink:0; width:20px; height:20px; border-radius:50%; border:1.5px solid var(--border); background:var(--bg); font-family:'Inter',sans-serif; font-size:0.56rem; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1; }
  .priority-dot:hover { opacity:0.75; }
  .task-due-input { flex:none !important; width:118px; background:var(--bg); border:1px solid var(--border); border-radius:4px; font-family:'Inter',sans-serif; font-size:0.62rem; padding:4px 6px; color:var(--text-muted); outline:none; }
  .task-due-input:focus { color:var(--text); border-color:var(--text-muted); }
  .remove-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:0.9rem; cursor:pointer; color:var(--text-muted); padding:3px; line-height:1; }
  .remove-btn:hover { color:var(--accent); }
  .small-link { background:none; border:none; font-family:'Inter',sans-serif; font-weight:500; font-size:0.66rem; color:var(--text-muted); cursor:pointer; padding:3px 0; text-decoration:underline; }
  .small-link:hover { color:var(--text); }
  .modal-footer { display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid var(--border); gap:10px; flex-wrap:wrap; }
  .modal-keyhints { display:flex; gap:12px; flex-wrap:wrap; align-items:center; font-family:'Inter',sans-serif; font-size:0.58rem; color:var(--text-muted); }
  .modal-keyhints kbd { color:var(--text); background:var(--modal-kbd-bg); padding:1px 4px; border:1px solid var(--modal-kbd-border); border-radius:3px; font-family:'Inter',sans-serif; font-size:0.58rem; margin-right:2px; }
  .btn-save { background:var(--border-strong); color:var(--bg); border:none; border-radius:6px; padding:7px 15px; font-family:'Inter',sans-serif; font-weight:600; font-size:0.7rem; cursor:pointer; }
  .btn-save:hover { opacity:0.85; }
  .btn-cancel { background:none; border:1px solid var(--border); border-radius:6px; color:var(--text-muted); padding:7px 15px; font-family:'Inter',sans-serif; font-weight:500; font-size:0.7rem; cursor:pointer; }
  .btn-cancel:hover { border-color:var(--text-muted); color:var(--text); }

  /* Modal — narrow screens */
  @media (max-width:600px) {
    .modal-overlay { padding:0; align-items:flex-end; }
    .modal { max-width:100%; max-height:92vh; padding:20px 16px 18px; }
    .modal-title { font-size:1.15rem; }
  }
  @media (max-width:480px) {
    /* Emoji/Title and Duration/Color 2-col grids (inline styles in Modal.jsx)
       are fine to leave side-by-side down to ~360px — only the dense
       4-column phase header needs to collapse. */
    .modal-phase-header { grid-template-columns:1fr 1fr; grid-template-areas:"label title" "duration actions"; }
    .modal-phase-header input:nth-child(1) { grid-area:label; }
    .modal-phase-header input:nth-child(2) { grid-area:title; }
    .modal-phase-header input:nth-child(3) { grid-area:duration; }
    .modal-phase-header div { grid-area:actions; justify-self:end; }
    .phase-task-row { flex-wrap:wrap; }
    .phase-task-row input[placeholder="Task description"] { flex:1 1 100%; order:1; }
    .task-due-input { order:2; width:auto; flex:1 !important; }
    .priority-dot { order:0; }
    .remove-btn { order:3; }
  }
  @media (max-width:760px) {
    .priority-dot, .remove-btn { width:26px; height:26px; }
    .task-due-input, .phase-task-row input, .modal-phase-header input { padding:7px 8px; font-size:0.74rem; }
  }

  /* Statusbar (keyhint bar) — slim and quiet at bottom */
  .keyhint-bar { position:fixed; bottom:0; left:0; right:0; height:auto; background:var(--bg); border-top:1px solid var(--border); color:var(--text-muted); font-family:'Inter',sans-serif; font-size:0.6rem; padding:5px 32px; display:flex; align-items:stretch; gap:0; letter-spacing:0; z-index:50; opacity:1; flex-wrap:nowrap; overflow:hidden; white-space:nowrap; }
  .keyhint-mode { background:none; color:var(--accent); font-family:'Inter',sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.05em; padding:0 10px 0 0; display:flex; align-items:center; flex-shrink:0; border-right:none; }
  .keyhint-item { display:flex; align-items:center; gap:4px; padding:0 12px 0 0; border-right:none; flex-shrink:0; }
  .keyhint-item:first-of-type { padding-left:10px; border-left:1px solid var(--border); }
  .keyhint-item:hover { background:rgba(0,0,0,0.1); }
  .keyhint-label { color:var(--text-muted); opacity:1; }
  .keyhint-bar kbd { color:var(--text); background:transparent; padding:0px 4px; border:1px solid var(--border); border-radius:3px; font-family:'Inter',sans-serif; font-size:0.6rem; }

  /* Help overlay */
  .help-overlay { position:fixed; inset:0; background:var(--overlay-bg-heavy); display:flex; align-items:center; justify-content:center; z-index:150; padding:24px; }
  .help-box { background:var(--bg); border:none; outline:1px solid var(--border); border-radius:12px; padding:26px; max-width:520px; width:100%; max-height:80vh; overflow-y:auto; }
  .help-title { font-size:1.15rem; font-weight:700; letter-spacing:-0.02em; margin-bottom:18px; }
  .help-section { margin-bottom:16px; }
  .help-section-title { font-family:'Inter',sans-serif; font-weight:600; font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:7px; border-bottom:1px solid var(--border); padding-bottom:4px; }
  .help-row { display:flex; justify-content:space-between; align-items:center; padding:3px 0; font-family:'Inter',sans-serif; font-size:0.76rem; }
  .help-row kbd { background:var(--modal-kbd-bg); border:1px solid var(--modal-kbd-border); border-radius:3px; padding:1px 5px; font-family:'Inter',sans-serif; font-size:0.66rem; }
  .help-close { margin-top:14px; font-family:'Inter',sans-serif; font-size:0.68rem; color:var(--text-muted); text-align:center; }

  /* Misc */
  .empty { text-align:center; color:var(--text-muted); font-family:'Inter',sans-serif; font-size:0.78rem; padding:60px 0; }
  .empty kbd { background:var(--border); padding:1px 5px; font-family:'Inter',sans-serif; }
  .checklist-footer { text-align:center; color:var(--text-muted); font-family:'Inter',sans-serif; font-size:0.65rem; opacity:0.5; margin-top:36px; border-top:none; padding-top:13px; }
  .err-msg { font-size:0.66rem; color:var(--accent); }

  /* Check-ins (progress journal) */
  .checkins-section { margin-top:28px; border-top:1px solid var(--border); padding-top:14px; }
  .checkins-header { display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-size:0.66rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.07em; user-select:none; padding-bottom:10px; }
  .checkins-header:hover { color:var(--text); }
  .checkins-collapse-icon { font-size:0.5rem; opacity:0.6; }
  .checkins-add-row { display:flex; gap:7px; margin-bottom:10px; }
  .checkins-input { flex:1; background:var(--bg-card); border:1px solid var(--border); border-radius:5px; font-family:'Inter',sans-serif; font-size:0.74rem; padding:7px 10px; color:var(--text); outline:none; }
  .checkins-input:focus { border-color:var(--text-muted); }
  .checkins-input::placeholder { color:var(--text-placeholder); }
  .checkins-add-btn { background:none; border:1px solid var(--border); border-radius:5px; color:var(--text-muted); font-family:'Inter',sans-serif; font-size:0.68rem; padding:0 14px; cursor:pointer; }
  .checkins-add-btn:hover:not(:disabled) { color:var(--text); border-color:var(--text-muted); }
  .checkins-add-btn:disabled { opacity:0.4; cursor:default; }
  .checkins-empty { font-size:0.68rem; color:var(--text-placeholder); padding:4px 0 2px; }
  .checkins-list { display:flex; flex-direction:column; gap:2px; }
  .checkin-row { display:flex; align-items:baseline; gap:10px; padding:6px 2px; border-bottom:1px solid var(--border); font-size:0.72rem; }
  .checkin-row:last-child { border-bottom:none; }
  .checkin-date { color:var(--text-muted); font-size:0.62rem; flex-shrink:0; width:52px; letter-spacing:0.03em; }
  .checkin-note { flex:1; color:var(--text); line-height:1.4; }
  .checkin-del { background:none; border:none; font-size:0.85rem; cursor:pointer; color:var(--text-placeholder); padding:0 2px; flex-shrink:0; line-height:1; }
  .checkin-del:hover { color:var(--accent); }
  .checkin-confirm { display:flex; gap:6px; flex-shrink:0; font-size:0.64rem; }

  /* Login */
  .login-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
  .login-box { max-width:340px; width:100%; text-align:center; }
  .login-logo { font-size:2rem; color:var(--accent); margin-bottom:14px; }
  .login-tagline { color:var(--text-muted); font-size:0.78rem; line-height:1.6; margin-bottom:28px; }
  .login-btn { display:block; width:100%; text-align:center; text-decoration:none; margin-bottom:10px; box-sizing:border-box; }
  .login-error { color:#D4522A; font-size:0.75rem; margin-bottom:16px; }
  .sync-toast { position:fixed; bottom:16px; left:50%; transform:translateX(-50%); z-index:1000; max-width:calc(100vw - 32px); background:var(--text); color:var(--bg); padding:10px 16px; border-radius:6px; font-size:0.75rem; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,0.25); }
  .login-loading { min-height:100vh; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.78rem; }
`;
