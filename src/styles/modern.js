// ──── Modern-mode CSS overrides ─────────────────────────────────────────────

export const modernStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

  body.modern { font-family: 'Inter', system-ui, sans-serif; }
  body.modern .serif { font-family: 'Inter', sans-serif; font-weight: 700; letter-spacing: -0.03em; }
  body.modern .app { max-width: 680px; padding: 0 32px 80px; }

  /* Header — almost invisible, just text */
  body.modern .header { border-bottom: none; padding: 48px 0 32px; margin-bottom: 8px; }
  body.modern .header h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text); }
  body.modern .header-right { gap: 12px; }

  /* Buttons — text-weight, barely there */
  body.modern .btn { font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500; padding: 6px 12px; border-radius: 5px; letter-spacing: 0; }
  body.modern .btn-dark { background: var(--text); color: var(--bg); }
  body.modern .btn-dark:hover { opacity: 0.75; }
  body.modern .btn-muted { border-color: transparent; color: var(--text-muted); }
  body.modern .btn-muted:hover { color: var(--text); border-color: transparent; background: var(--bg-hover); }

  /* Mode toggle */
  body.modern .mode-toggle-btn { font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500; border: none; border-radius: 5px; color: var(--text-muted); letter-spacing: 0; padding: 4px 10px; }
  body.modern .mode-toggle-btn:hover { background: var(--bg-hover); color: var(--text); border-color: transparent; }

  /* Topbar — modern */
  body.modern .topbar { background: var(--bg); border-bottom: 1px solid var(--border); }
  body.modern .topbar-title { font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 700; letter-spacing: -0.02em; }
  body.modern .topbar-nav-btn { font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500; letter-spacing: 0; }
  body.modern .topbar-view-btn { font-family: 'Inter', sans-serif; }
  body.modern .topbar-import-btn { font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500; }
  body.modern .topbar-new-btn { font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 600; border-radius: 6px; }

  /* Statusbar — modern */
  body.modern .keyhint-bar { font-family: 'Inter', sans-serif; font-size: 0.6rem; }
  body.modern .keyhint-mode { font-family: 'Inter', sans-serif; font-weight: 700; letter-spacing: 0.06em; }
  body.modern .keyhint-bar kbd { font-family: 'Inter', sans-serif; border-radius: 2px; }

  /* Scheme dots */
  body.modern .scheme-dot { width: 12px; height: 12px; }

  /* Filter tabs — underline style */
  body.modern .filter-tabs { border: none; gap: 0; background: none; }
  body.modern .filter-tab { font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500; padding: 4px 14px 8px; border: none; border-bottom: 2px solid transparent; border-right: none; color: var(--text-muted); letter-spacing: 0; }
  body.modern .filter-tab.active { background: none; color: var(--text); border-bottom-color: var(--text); }
  body.modern .filter-tab:last-child { border-right: none; }

  /* View buttons */
  body.modern .view-btn { font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 500; border: none; color: var(--text-muted); padding: 4px 10px; border-radius: 5px; }
  body.modern .view-btn.active { background: var(--bg-hover); color: var(--text); border: none; }

  /* Search */
  body.modern .search-input { font-family: 'Inter', sans-serif; border-radius: 6px; }

  /* Grid cards — clean floating rectangles, no border */
  body.modern .grid { gap: 10px; }
  body.modern .card { border: none; border-radius: 10px; padding: 20px; background: var(--bg-card); transition: background 0.12s; }
  body.modern .card:hover { background: var(--bg-hover); }
  body.modern .card.focused { background: var(--bg-hover); outline: 1.5px solid var(--text-muted); outline-offset: 0; }
  body.modern .card-emoji { font-size: 1.2rem; margin-bottom: 10px; }
  body.modern .card-title { font-size: 0.95rem; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 4px; }
  body.modern .card-desc { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 14px; line-height: 1.5; }
  body.modern .card-duration { font-size: 0.66rem; color: var(--text-muted); }

  /* List cards */
  body.modern .list-view { gap: 2px; }
  body.modern .list-card { border: none; border-radius: 8px; padding: 12px 14px; background: transparent; transition: background 0.1s; }
  body.modern .list-card:hover { background: var(--bg-hover); outline: none; }
  body.modern .list-card.focused { background: var(--bg-hover); outline: 1.5px solid var(--text-muted); }
  body.modern .list-card-title { font-size: 0.85rem; font-weight: 500; }
  body.modern .list-card-desc { font-size: 0.68rem; }

  /* Compact */
  body.modern .compact-view { border: none; background: none; gap: 0; }
  body.modern .compact-card { border: none; border-radius: 6px; background: transparent; transition: background 0.1s; padding: 8px 10px; }
  body.modern .compact-card:hover { background: var(--bg-hover); outline: none; }
  body.modern .compact-card.focused { background: var(--bg-hover); outline: 1.5px solid var(--text-muted); }
  body.modern .compact-card-title { font-size: 0.78rem; font-weight: 500; }

  /* Progress */
  body.modern .progress-bar-bg { height: 2px; border-radius: 99px; }
  body.modern .progress-bar-fill { border-radius: 99px; }
  body.modern .progress-label { font-size: 0.66rem; color: var(--text-muted); }
  body.modern .progress-label-large { font-size: 0.7rem; font-weight: 500; letter-spacing: 0; text-transform: none; margin-bottom: 8px; }

  /* Detail header */
  body.modern .detail-header { border-bottom: none; padding: 42px 0 16px; margin-bottom: 20px; }
  body.modern .detail-header h1 { font-size: 1.8rem; font-weight: 700; letter-spacing: -0.03em; }
  body.modern .detail-subtitle { font-size: 0.73rem; color: var(--text-muted); letter-spacing: 0; text-transform: none; }
  body.modern .back-btn { font-family: 'Inter', sans-serif; font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
  body.modern .back-btn:hover { color: var(--text); }
  body.modern .action-btn { font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500; color: var(--text-muted); }
  body.modern .action-btn:hover { color: var(--text); }
  body.modern .confirm-delete, body.modern .confirm-btn { font-family: 'Inter', sans-serif; }

  /* Phase — just a quiet label */
  body.modern .phase-section { margin-bottom: 32px; }
  body.modern .phase-label { background: none; color: var(--text-muted); font-family: 'Inter', sans-serif; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 0 0 10px; border-bottom: none; margin-bottom: 2px; gap: 6px; }
  body.modern .phase-label:hover { opacity: 0.65; }
  body.modern .phase-done-summary { font-family: 'Inter', sans-serif; font-size: 0.7rem; color: var(--text-muted); padding: 8px 0; }
  body.modern .phase-label-focused { background: transparent !important; color: var(--text) !important; opacity: 1 !important; border-bottom: 1px solid var(--accent) !important; }
  body.modern .phase-done-summary-focused { color: var(--text) !important; }

  /* Tasks — pure rows, ultra minimal */
  body.modern .tasks-list { border: none; background: none; }
  body.modern .task-row { padding: 9px 0; border-bottom: 1px solid var(--border); background: transparent; border-radius: 0; transition: none; }
  body.modern .task-row:last-child { border-bottom: none; }
  body.modern .task-row:hover { background: transparent; }
  body.modern .task-row.focused { background: transparent; outline: none; }
  body.modern .task-row.focused .task-text { color: var(--text); }
  body.modern .task-row.focused::before { content: '›'; position: absolute; left: -14px; color: var(--accent); font-size: 1rem; line-height: 1; margin-top: 1px; }
  body.modern .task-row { position: relative; }
  body.modern .task-row.search-match .task-text { text-decoration-line: underline; text-decoration-color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 3px; }
  body.modern .task-row.search-current .task-text { text-decoration-line: underline; text-decoration-color: var(--accent); text-decoration-thickness: 2px; text-underline-offset: 3px; color: var(--text); }
  body.modern .task-row.search-match { background: transparent; border-left: none; padding-left: 0; }
  body.modern .task-row.search-current { background: transparent; border-left: none; padding-left: 0; }
  body.modern .task-row.search-current::before { content: '›'; position: absolute; left: -14px; color: var(--accent); font-size: 1rem; line-height: 1.5; }
  body.modern .task-row.selected { background: transparent; outline: none; }
  body.modern .task-row.selected .task-text { opacity: 0.6; }
  body.modern .task-text { font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 400; line-height: 1.5; }
  body.modern .task-text.done { text-decoration: line-through; color: var(--text-muted); opacity: 0.6; }
  body.modern .tag { font-family: 'Inter', sans-serif; font-size: 0.6rem; border-radius: 3px; font-weight: 500; }

  /* Checkbox */
  body.modern .checkbox { border-radius: 4px; border-width: 1.5px; width: 14px; height: 14px; font-size: 9px; }
  body.modern .checkbox.checked { border-radius: 4px; }

  /* Add task */
  body.modern .add-task-row { background: transparent; border-top: none; padding: 6px 0; }
  body.modern .add-task-input { font-family: 'Inter', sans-serif; font-size: 0.82rem; }
  body.modern .add-task-link { font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500; padding: 8px 0; color: var(--text-muted); }
  body.modern .add-task-link:hover { color: var(--text); }
  body.modern .add-task-link.focused { color: var(--text); outline: none; }

  /* Footer */
  body.modern .checklist-footer { font-family: 'Inter', sans-serif; border-top: none; color: var(--text-muted); opacity: 0.5; font-size: 0.65rem; }

  /* Keyhint bar — slim and quiet at bottom */
  body.modern .keyhint-bar {
    background: var(--bg);
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    font-family: 'Inter', sans-serif;
    font-size: 0.6rem;
    padding: 5px 32px;
    gap: 0;
    opacity: 1;
    flex-wrap: nowrap;
    overflow: hidden;
    white-space: nowrap;
  }
  body.modern .keyhint-item { padding: 0 12px 0 0; gap: 4px; }
  body.modern .keyhint-item:first-of-type { padding-left: 10px; border-left: 1px solid var(--border); }
  body.modern .keyhint-label { color: var(--text-muted); }
  body.modern .keyhint-bar kbd { background: transparent; border: 1px solid var(--border); color: var(--text); border-radius: 3px; font-family: 'Inter', sans-serif; font-size: 0.6rem; padding: 0px 4px; }
  body.modern .keyhint-mode { font-family: 'Inter', sans-serif; font-size: 0.62rem; font-weight: 600; letter-spacing: 0.05em; color: var(--accent); padding-right: 10px; }

  /* Modal */
  body.modern .modal-overlay { background: var(--overlay-bg); }
  body.modern .modal { border-radius: 12px; border: none; outline: 1px solid var(--border); padding: 28px; }
  body.modern .modal-title { font-weight: 700; letter-spacing: -0.02em; }
  body.modern .field label { font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.04em; }
  body.modern .field input, body.modern .field textarea { font-family: 'Inter', sans-serif; font-size: 0.8rem; border-radius: 5px; }
  body.modern .modal-phase { border-radius: 7px; }
  body.modern .modal-phase-header input, body.modern .phase-task-row input { font-family: 'Inter', sans-serif; border-radius: 4px; }
  body.modern .remove-btn { font-family: 'Inter', sans-serif; }
  body.modern .small-link { font-family: 'Inter', sans-serif; font-weight: 500; }
  body.modern .btn-save { font-family: 'Inter', sans-serif; font-weight: 600; border-radius: 6px; }
  body.modern .btn-cancel { font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 6px; }
  body.modern .modal-keyhints { font-family: 'Inter', sans-serif; }
  body.modern .modal-keyhints kbd { border-radius: 3px; font-family: 'Inter', sans-serif; }

  /* Help overlay */
  body.modern .help-overlay { background: var(--overlay-bg-heavy); }
  body.modern .help-box { border: none; outline: 1px solid var(--border); border-radius: 12px; }
  body.modern .help-title { font-weight: 700; letter-spacing: -0.02em; }
  body.modern .help-section-title { font-family: 'Inter', sans-serif; font-weight: 600; letter-spacing: 0.04em; }
  body.modern .help-row { font-family: 'Inter', sans-serif; font-size: 0.76rem; }
  body.modern .help-row kbd { border-radius: 3px; font-family: 'Inter', sans-serif; font-size: 0.66rem; }
  body.modern .help-close { font-family: 'Inter', sans-serif; }

  /* Floating search */
  body.modern .detail-search { border-radius: 8px; border: none; outline: 1px solid var(--border); }
  body.modern .detail-search input { font-family: 'Inter', sans-serif; font-size: 0.85rem; }
  body.modern .detail-search-info { font-family: 'Inter', sans-serif; }

  /* Empty state */
  body.modern .empty { font-family: 'Inter', sans-serif; font-weight: 400; }
`;
