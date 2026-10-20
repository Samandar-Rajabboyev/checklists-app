// ──── Classic/Notion-style CSS ──────────────────────────────────────────────

export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; min-height: 100vh; padding-bottom: 24px; }
  .serif { font-family: 'Fraunces', serif; font-weight: 600; }
  .app { max-width: 960px; margin: 0 auto; padding: 0 24px 60px; }

  /* Topbar */
  .topbar { position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between; height:48px; padding:0 24px; background:var(--bg-card); border-bottom:1px solid var(--border); margin:0 -24px 28px; gap:0; }
  .topbar-brand { display:flex; align-items:center; gap:8px; min-width:0; flex-shrink:0; margin-right:24px; }
  .topbar-logo { font-size:1rem; color:var(--accent); flex-shrink:0; }
  .topbar-title { font-size:1rem; line-height:1; white-space:nowrap; }
  .topbar-nav { display:flex; align-items:stretch; height:100%; flex:1; gap:0; }
  .topbar-nav-btn { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.68rem; color:var(--text-muted); cursor:pointer; padding:0 16px; border-bottom:2px solid transparent; letter-spacing:0.04em; transition:color 0.1s; white-space:nowrap; }
  .topbar-nav-btn:hover { color:var(--text); }
  .topbar-nav-btn.active { color:var(--text); border-bottom-color:var(--accent); }
  .topbar-actions { display:flex; align-items:center; gap:6px; flex-shrink:0; margin-left:16px; }
  .topbar-views { display:flex; align-items:center; gap:1px; background:var(--border); padding:1px; }
  .topbar-view-btn { background:none; border:none; font-size:0.85rem; cursor:pointer; color:var(--text-muted); padding:3px 7px; line-height:1; }
  .topbar-view-btn:hover { color:var(--text); }
  .topbar-view-btn.active { background:var(--bg); color:var(--text); }
  .topbar-divider { width:1px; height:20px; background:var(--border); margin:0 4px; flex-shrink:0; }
  .topbar-import-btn { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.66rem; color:var(--text-muted); cursor:pointer; padding:5px 8px; letter-spacing:0.03em; }
  .topbar-import-btn:hover { color:var(--text); }
  .topbar-new-btn { background:var(--border-strong); color:var(--bg); border:none; font-family:'DM Mono',monospace; font-size:0.68rem; cursor:pointer; padding:6px 13px; letter-spacing:0.04em; white-space:nowrap; }
  .topbar-new-btn:hover { opacity:0.82; }

  /* Buttons */
  .btn { border:none; font-family:'DM Mono',monospace; font-size:0.72rem; cursor:pointer; padding:7px 13px; letter-spacing:0.04em; }
  .btn-dark { background:var(--border-strong); color:var(--bg); }
  .btn-dark:hover { opacity:0.85; }
  .btn-muted { background:none; border:1px solid var(--border); color:var(--text-muted); }
  .btn-muted:hover { border-color:var(--text-muted); color:var(--text); }

  /* Scheme picker */
  .scheme-picker { display:flex; gap:5px; align-items:center; }

  /* UI mode toggle */
  .mode-toggle-btn { background:none; border:1px solid var(--border); font-family:'DM Mono',monospace; font-size:0.64rem; color:var(--text-muted); cursor:pointer; padding:4px 10px; letter-spacing:0.04em; }
  .mode-toggle-btn:hover { color:var(--text); border-color:var(--text-muted); }
  .scheme-dot { width:14px; height:14px; cursor:pointer; border-radius:50%; flex-shrink:0; transition:transform 0.1s; }
  .scheme-dot:hover { transform:scale(1.2); }
  .scheme-dot.active { outline:2px solid var(--text); outline-offset:2px; }

  /* Search bar on home */
  .search-bar { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
  .search-input { flex:1; background:var(--bg-card); border:1px solid var(--border); font-family:'DM Mono',monospace; font-size:0.82rem; padding:8px 12px; color:var(--text); outline:none; }
  .search-input:focus { border-color:var(--text-muted); }
  .search-clear { background:none; border:none; font-size:1rem; cursor:pointer; color:var(--text-muted); padding:0 4px; }
  .search-clear:hover { color:var(--accent); }

  /* Filter/view (kept for compat, now used via topbar classes) */
  .filter-tab { display:none; }
  .view-btn { display:none; }

  /* Cards — grid */
  .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
  @media (max-width:600px) { .grid { grid-template-columns:1fr; } }
  .card { background:var(--bg-card); border:1px solid var(--border); padding:20px 18px 16px; cursor:pointer; }
  .card:hover { background:var(--bg-hover); }
  .card.focused { background:var(--bg-hover); outline:2px solid var(--accent); outline-offset:-2px; }
  .card-archived { opacity:0.5; }
  .card-emoji { font-size:1.4rem; margin-bottom:7px; }
  .card-title { font-size:1.1rem; margin-bottom:5px; }
  .card-desc { color:var(--text-muted); font-size:0.7rem; line-height:1.5; margin-bottom:12px; }
  .card-meta { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  .card-duration { font-size:0.64rem; color:var(--text-muted); }
  .card-archived-badge { font-size:0.6rem; color:var(--text-muted); border:1px solid var(--border); padding:1px 5px; letter-spacing:0.05em; }

  /* Cards — list */
  .list-view { display:flex; flex-direction:column; gap:8px; }
  .list-card { background:var(--bg-card); border:1px solid var(--border); padding:11px 14px; cursor:pointer; display:flex; align-items:center; gap:12px; }
  .list-card:hover, .list-card.focused { background:var(--bg-hover); outline:2px solid var(--accent); outline-offset:-2px; }
  .list-card-emoji { font-size:1.1rem; flex-shrink:0; }
  .list-card-body { flex:1; min-width:0; }
  .list-card-title { font-size:0.88rem; margin-bottom:2px; }
  .list-card-desc { font-size:0.66rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .list-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:3px; flex-shrink:0; }

  /* Cards — compact */
  .compact-view { display:flex; flex-direction:column; border:1px solid var(--border); }
  .compact-card { background:var(--bg-card); border-bottom:1px solid var(--border); padding:8px 13px; cursor:pointer; display:flex; align-items:center; gap:10px; }
  .compact-card:last-child { border-bottom:none; }
  .compact-card:hover, .compact-card.focused { background:var(--bg-hover); outline:2px solid var(--accent); outline-offset:-2px; }
  .compact-card-emoji { font-size:0.95rem; flex-shrink:0; }
  .compact-card-title { font-size:0.76rem; flex:1; }
  .compact-progress-text { font-size:0.63rem; color:var(--text-muted); flex-shrink:0; }

  /* Progress */
  .progress-bar-bg { height:3px; background:var(--border); margin-bottom:5px; }
  .progress-bar-fill { height:100%; }
  .progress-label { font-size:0.64rem; color:var(--text-muted); }
  .progress-label-large { font-size:0.74rem; color:var(--text-muted); letter-spacing:0.06em; margin-bottom:12px; text-transform:uppercase; }

  /* Detail header */
  .detail-header { padding:32px 0 18px; border-bottom:1.5px solid var(--border-strong); margin-bottom:28px; }
  .detail-header-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
  .detail-title-row { display:flex; flex-direction:column; gap:5px; }
  .detail-back-row { display:flex; align-items:center; gap:10px; }
  .detail-subtitle { font-size:0.66rem; color:var(--text-muted); letter-spacing:0.08em; text-transform:uppercase; }
  .back-btn { background:none; border:none; font-family:'DM Mono',monospace; font-size:1rem; cursor:pointer; color:var(--text); padding:0; line-height:1; }
  .back-btn:hover { color:var(--accent); }
  .detail-actions { display:flex; gap:10px; flex-wrap:wrap; }
  .action-btn { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.68rem; cursor:pointer; color:var(--text-muted); padding:0; }
  .action-btn:hover { color:var(--text); }
  .action-btn.danger:hover { color:var(--accent); }
  .confirm-delete { font-size:0.7rem; color:var(--accent); display:flex; align-items:center; gap:8px; }
  .confirm-btn { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.7rem; cursor:pointer; color:var(--text-muted); text-decoration:underline; padding:0; }
  .confirm-btn:hover { color:var(--text); }
  .confirm-btn.yes { color:var(--accent); }

  /* Phase section */
  .phase-section { margin-bottom:28px; }
  .phase-label { display:inline-flex; align-items:center; gap:7px; background:var(--phase-bar); color:var(--phase-bar-text); font-family:'DM Mono',monospace; font-size:0.64rem; letter-spacing:0.08em; padding:5px 11px; margin-bottom:10px; text-transform:uppercase; cursor:pointer; user-select:none; }
  .phase-label:hover { opacity:0.82; }
  .phase-collapse-icon { font-size:0.5rem; opacity:0.6; }
  .phase-done-summary { font-size:0.65rem; color:var(--text-muted); margin-bottom:12px; padding-left:2px; }
  .phase-label-focused { background: var(--accent) !important; color: var(--bg) !important; opacity: 1 !important; }
  .phase-label-focused .phase-collapse-icon { opacity: 1 !important; }
  .phase-label-search { outline: 2px solid var(--accent); outline-offset: -2px; }
  .phase-done-summary-focused { color: var(--text) !important; font-weight: 500; }

  /* Task list */
  .tasks-list { border:1px solid var(--border); background:var(--bg-card); }
  .task-row { display:flex; flex-direction:column; padding:11px 15px; border-bottom:1px solid var(--border); cursor:pointer; }
  .task-row:last-child { border-bottom:none; }
  .task-row:hover { background:var(--bg-hover); }
  .task-row.focused { background:var(--bg-hover); outline:2px solid var(--accent); outline-offset:-2px; }
  .task-row.selected { background:var(--bg-hover); outline:2px solid #D4A22A; outline-offset:-2px; }
  .task-row.selected.focused { outline-color:var(--accent); }
  .task-row.dragging { opacity:0.35; }
  .task-row.search-match { background: var(--bg-hover); }
  .task-row.search-current { background: var(--bg-hover); border-left: 2px solid var(--accent); padding-left: 13px; }
  .task-row-main { display:flex; align-items:center; gap:11px; }
  .checkbox { width:15px; height:15px; border:1.5px solid var(--text-muted); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:10px; color:var(--bg); cursor:pointer; }
  .checkbox.checked { background:var(--accent); border-color:var(--accent); }
  .task-body { flex:1; min-width:0; }
  .task-text { font-size:0.75rem; line-height:1.4; }
  .task-text.done { text-decoration:line-through; color:var(--text-muted); }
  .tag { font-size:0.58rem; letter-spacing:0.05em; padding:1px 5px; border:1px solid var(--border); color:var(--text-muted); white-space:nowrap; text-transform:uppercase; margin-left:8px; }

  /* Add task */
  .add-task-row { padding:8px 13px; border-top:1px solid var(--border); background:var(--bg-card); }
  .add-task-input { width:100%; border:none; background:transparent; font-family:'DM Mono',monospace; font-size:0.75rem; color:var(--text); outline:none; }
  .add-task-input::placeholder { color:var(--text-placeholder); }
  .add-task-link { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.68rem; color:var(--text-muted); cursor:pointer; padding:8px 13px; display:block; }
  .add-task-link:hover { color:var(--accent); }
  .add-task-link.focused { color:var(--accent); outline:2px solid var(--accent); outline-offset:-2px; }

  /* Floating search */
  .detail-search { position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:80; background:var(--bg-card); border:1.5px solid var(--border-strong); display:flex; align-items:center; gap:8px; padding:8px 14px; width:360px; max-width:90vw; box-shadow:0 4px 24px rgba(0,0,0,0.18); }
  .detail-search input { flex:1; border:none; background:transparent; font-family:'DM Mono',monospace; font-size:0.82rem; color:var(--text); outline:none; }
  .detail-search input::placeholder { color:var(--text-placeholder); }
  .detail-search-icon { color:var(--text-muted); font-size:0.8rem; flex-shrink:0; }
  .detail-search-info { font-size:0.64rem; color:var(--text-muted); white-space:nowrap; flex-shrink:0; }
  .detail-search-close { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:0; line-height:1; flex-shrink:0; }
  .detail-search-close:hover { color:var(--text); }

  /* Modal */
  .modal-overlay { position:fixed; inset:0; background:var(--overlay-bg); display:flex; align-items:center; justify-content:center; z-index:100; padding:24px; }
  .modal { background:var(--bg); border:1.5px solid var(--border-strong); width:100%; max-width:600px; max-height:85vh; overflow-y:auto; padding:26px 24px; }
  .modal-title { font-size:1.3rem; margin-bottom:20px; }
  .field { margin-bottom:13px; }
  .field label { display:block; font-size:0.64rem; color:var(--text-muted); letter-spacing:0.06em; text-transform:uppercase; margin-bottom:4px; }
  .field input, .field textarea { width:100%; background:var(--bg-card); border:1px solid var(--border); font-family:'DM Mono',monospace; font-size:0.78rem; color:var(--text); padding:6px 9px; outline:none; }
  .field input:focus, .field textarea:focus { border-color:var(--text-muted); }
  .field textarea { resize:vertical; min-height:52px; }
  .color-swatches { display:flex; gap:7px; margin-top:4px; }
  .swatch { width:21px; height:21px; cursor:pointer; border:2px solid transparent; }
  .swatch.selected { border-color:var(--border-strong); }
  .modal-phases { margin-top:16px; }
  .modal-phase { border:1px solid var(--border); background:var(--bg-card); padding:11px; margin-bottom:9px; }
  .modal-phase-header { display:grid; grid-template-columns:1fr 1fr 76px auto; gap:5px; margin-bottom:7px; align-items:start; }
  .modal-phase-header input { background:var(--bg); border:1px solid var(--border); font-family:'DM Mono',monospace; font-size:0.7rem; padding:4px 6px; color:var(--text); outline:none; width:100%; }
  .phase-task-row { display:flex; gap:5px; align-items:center; margin-bottom:5px; }
  .phase-task-row input { flex:1; background:var(--bg); border:1px solid var(--border); font-family:'DM Mono',monospace; font-size:0.7rem; padding:4px 6px; color:var(--text); outline:none; }
  .remove-btn { background:none; border:none; font-size:0.9rem; cursor:pointer; color:var(--text-muted); padding:3px; line-height:1; }
  .remove-btn:hover { color:var(--accent); }
  .small-link { background:none; border:none; font-family:'DM Mono',monospace; font-size:0.66rem; color:var(--text-muted); cursor:pointer; padding:3px 0; text-decoration:underline; }
  .small-link:hover { color:var(--text); }
  .modal-footer { display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid var(--border); gap:10px; flex-wrap:wrap; }
  .modal-keyhints { display:flex; gap:12px; flex-wrap:wrap; align-items:center; font-size:0.58rem; color:var(--text-muted); }
  .modal-keyhints kbd { color:var(--text); background:var(--modal-kbd-bg); padding:1px 4px; border:1px solid var(--modal-kbd-border); font-family:'DM Mono',monospace; font-size:0.58rem; margin-right:2px; }
  .btn-save { background:var(--border-strong); color:var(--bg); border:none; padding:7px 15px; font-family:'DM Mono',monospace; font-size:0.7rem; cursor:pointer; }
  .btn-save:hover { opacity:0.85; }
  .btn-cancel { background:none; border:1px solid var(--border); color:var(--text-muted); padding:7px 15px; font-family:'DM Mono',monospace; font-size:0.7rem; cursor:pointer; }
  .btn-cancel:hover { border-color:var(--text-muted); color:var(--text); }

  /* Statusbar (keyhint bar) */
  .keyhint-bar { position:fixed; bottom:0; left:0; right:0; height:24px; background:var(--accent); color:var(--bg); font-family:'DM Mono',monospace; font-size:0.59rem; padding:0; display:flex; align-items:stretch; letter-spacing:0.03em; z-index:50; overflow:hidden; white-space:nowrap; }
  .keyhint-mode { background:rgba(0,0,0,0.18); color:var(--bg); font-size:0.59rem; font-weight:bold; letter-spacing:0.1em; padding:0 14px; display:flex; align-items:center; flex-shrink:0; border-right:1px solid rgba(0,0,0,0.12); }
  .keyhint-item { display:flex; align-items:center; gap:4px; padding:0 10px; border-right:1px solid rgba(0,0,0,0.1); flex-shrink:0; }
  .keyhint-item:hover { background:rgba(0,0,0,0.1); }
  .keyhint-label { color:var(--bg); opacity:0.82; }
  .keyhint-bar kbd { color:var(--bg); background:rgba(0,0,0,0.18); padding:0px 4px; border:none; font-family:'DM Mono',monospace; font-size:0.59rem; border-radius:2px; }

  /* Help overlay */
  .help-overlay { position:fixed; inset:0; background:var(--overlay-bg-heavy); display:flex; align-items:center; justify-content:center; z-index:150; padding:24px; }
  .help-box { background:var(--bg); border:1.5px solid var(--border-strong); padding:26px; max-width:520px; width:100%; max-height:80vh; overflow-y:auto; }
  .help-title { font-size:1.15rem; margin-bottom:18px; }
  .help-section { margin-bottom:16px; }
  .help-section-title { font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:7px; border-bottom:1px solid var(--border); padding-bottom:4px; }
  .help-row { display:flex; justify-content:space-between; align-items:center; padding:3px 0; font-size:0.7rem; }
  .help-row kbd { background:var(--modal-kbd-bg); border:1px solid var(--modal-kbd-border); padding:1px 5px; font-family:'DM Mono',monospace; font-size:0.66rem; }
  .help-close { margin-top:14px; font-size:0.68rem; color:var(--text-muted); text-align:center; }

  /* Misc */
  .empty { text-align:center; color:var(--text-muted); font-size:0.78rem; padding:60px 0; }
  .empty kbd { background:var(--border); padding:1px 5px; font-family:'DM Mono',monospace; }
  .checklist-footer { text-align:center; color:var(--text-muted); font-size:0.66rem; margin-top:36px; border-top:1px solid var(--border); padding-top:13px; }
  .err-msg { font-size:0.66rem; color:var(--accent); }

  /* Login */
  .login-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
  .login-box { max-width:340px; width:100%; text-align:center; }
  .login-logo { font-size:2rem; color:var(--accent); margin-bottom:14px; }
  .login-tagline { color:var(--text-muted); font-size:0.78rem; line-height:1.6; margin-bottom:28px; }
  .login-btn { display:block; width:100%; text-align:center; text-decoration:none; margin-bottom:10px; box-sizing:border-box; }
  .login-loading { min-height:100vh; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.78rem; }
`;
