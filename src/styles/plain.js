// ──── Plain-mode (sidebar layout) CSS overrides ────────────────────────────

export const plainStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

  body.plain { font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace; background: var(--bg); color: var(--text); }
  body.plain * { font-family: inherit; }

  /* Full page layout — sidebar + content */
  body.plain .plain-layout { display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar */
  body.plain .plain-sidebar { width: 200px; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; padding: 48px 0 24px; display: flex; flex-direction: column; }
  body.plain .plain-sidebar-title { font-size: 0.65rem; color: var(--text-muted); padding: 0 16px 8px; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
  body.plain .plain-sidebar-item { display: flex; align-items: center; gap: 6px; padding: 3px 16px; font-size: 0.78rem; cursor: pointer; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; user-select: none; }
  body.plain .plain-sidebar-item:hover { color: var(--text); }
  body.plain .plain-sidebar-item.active { color: var(--text); background: var(--bg-hover); }
  body.plain .plain-sidebar-item.focused { color: var(--text); background: var(--bg-hover); outline: none; }
  body.plain .plain-sidebar-item .si-icon { flex-shrink: 0; font-size: 0.7rem; opacity: 0.5; }
  body.plain .plain-sidebar-item .si-progress { font-size: 0.62rem; color: var(--text-muted); margin-left: auto; flex-shrink: 0; }
  body.plain .plain-sidebar-new { padding: 8px 16px 0; border-top: 1px solid var(--border); margin-top: 8px; display: flex; justify-content: space-between; }
  body.plain .plain-sidebar-new button { background: none; border: none; color: var(--text-muted); font-size: 0.72rem; cursor: pointer; padding: 0; }
  body.plain .plain-sidebar-new button:hover { color: var(--text); }

  /* Main content */
  body.plain .plain-main { flex: 1; overflow-y: auto; padding: 48px 48px 80px; }

  /* Plain header */
  body.plain .plain-header { margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
  body.plain .plain-header-title { font-size: 1rem; font-weight: 500; margin-bottom: 4px; }
  body.plain .plain-header-meta { font-size: 0.7rem; color: var(--text-muted); display: flex; gap: 16px; }
  body.plain .plain-header-actions { display: flex; gap: 16px; margin-top: 8px; }
  body.plain .plain-header-action { background: none; border: none; font-size: 0.7rem; color: var(--text-muted); cursor: pointer; padding: 0; }
  body.plain .plain-header-action:hover { color: var(--text); }
  body.plain .plain-header-action.danger:hover { color: #e06c75; }

  /* Progress line */
  body.plain .plain-progress { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  body.plain .plain-progress-bar { flex: 1; max-width: 160px; height: 1px; background: var(--border); position: relative; }
  body.plain .plain-progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--text-muted); }

  /* Phase */
  body.plain .plain-phase { margin-bottom: 20px; }
  body.plain .plain-phase-header { display: flex; align-items: baseline; gap: 8px; cursor: pointer; padding: 2px 0; user-select: none; }
  body.plain .plain-phase-header:hover .plain-phase-name { color: var(--text); }
  body.plain .plain-phase-arrow { font-size: 0.7rem; color: var(--text-muted); width: 10px; flex-shrink: 0; }
  body.plain .plain-phase-name { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); }
  body.plain .plain-phase-name.focused { color: var(--text); }
  body.plain .plain-phase-summary { font-size: 0.72rem; color: var(--text-muted); margin-left: 4px; }

  /* Tasks */
  body.plain .plain-tasks { padding-left: 18px; margin-top: 4px; }
  body.plain .plain-task { display: flex; align-items: baseline; gap: 8px; padding: 2px 0; cursor: pointer; font-size: 0.78rem; color: var(--text-muted); }
  body.plain .plain-task:hover { color: var(--text); }
  body.plain .plain-task.focused { color: var(--text); }
  body.plain .plain-task.selected { color: var(--accent); }
  body.plain .plain-task-num { color: var(--text-muted); opacity: 0.4; font-size: 0.68rem; width: 18px; text-align: right; flex-shrink: 0; }
  body.plain .plain-task-check { flex-shrink: 0; color: var(--text-muted); font-size: 0.78rem; }
  body.plain .plain-task-check.done { color: var(--text); }
  body.plain .plain-task-text { flex: 1; line-height: 1.5; color: var(--text); }
  body.plain .plain-task-text.done { text-decoration: line-through; color: var(--text-muted); opacity: 0.5; }
  body.plain .plain-task.focused .plain-task-num { color: var(--accent); opacity: 1; }
  body.plain .plain-task.focused::before { content: ''; }

  /* Add task inline */
  body.plain .plain-add-task { padding: 2px 0; padding-left: 26px; }
  body.plain .plain-add-task input { background: none; border: none; border-bottom: 1px solid var(--border); font-size: 0.78rem; color: var(--text); outline: none; width: 200px; padding: 1px 4px; }
  body.plain .plain-add-link { background: none; border: none; font-size: 0.72rem; color: var(--text-muted); cursor: pointer; padding: 2px 0; opacity: 0.4; }
  body.plain .plain-add-link:hover { opacity: 1; }
  body.plain .plain-add-link.focused { opacity: 1; color: var(--accent); }

  /* Confirm */
  body.plain .plain-confirm { font-size: 0.72rem; color: var(--text-muted); display: inline-flex; gap: 8px; }
  body.plain .plain-confirm-btn { background: none; border: none; font-size: 0.72rem; cursor: pointer; text-decoration: underline; color: var(--text-muted); padding: 0; }
  body.plain .plain-confirm-btn:hover { color: var(--text); }
  body.plain .plain-confirm-btn.yes { color: #e06c75; }

  /* Home screen in plain mode */
  body.plain .plain-home { display: flex; height: 100vh; overflow: hidden; }
  body.plain .plain-home-sidebar { width: 200px; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; padding: 48px 0 24px; }
  body.plain .plain-home-main { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.78rem; }
  body.plain .plain-home-hint { text-align: center; line-height: 2; }

  /* Statusbar override */
  body.plain .keyhint-bar { font-family: 'JetBrains Mono', monospace; font-size: 0.58rem; }
  body.plain .keyhint-mode { font-family: inherit; }
  body.plain .keyhint-bar kbd { font-family: inherit; }

  /* Mobile-only sidebar toggle — hidden by default; shown only under the
     narrow-screen breakpoint below where the sidebar becomes a drawer. */
  body.plain .plain-sidebar-toggle { display: none; }
  body.plain .plain-sidebar-backdrop { display: none; }

  /* Sidebar as an off-canvas drawer on phones/narrow tablets. The 200px
     fixed sidebar would otherwise eat over half of a 375px viewport, so
     below 700px it's hidden off-screen by default and slides in as an
     overlay when focusArea === "sidebar" (PlainApp.jsx already tracks
     this for keyboard routing — reused here via the plain-sidebar-open
     class rather than adding new state). A tap on the backdrop or a
     sidebar item returns focusArea to "content", closing the drawer. */
  @media (max-width: 700px) {
    body.plain .plain-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 82vw;
      max-width: 300px;
      z-index: 70;
      background: var(--bg);
      box-shadow: 2px 0 16px rgba(0,0,0,0.3);
      transform: translateX(-100%);
      transition: transform 0.18s ease;
      padding-top: 16px;
    }
    body.plain .plain-sidebar.plain-sidebar-open { transform: translateX(0); }
    body.plain .plain-sidebar-item { padding: 10px 16px; font-size: 0.84rem; }
    body.plain .plain-sidebar-new { padding: 12px 16px 0; }
    body.plain .plain-sidebar-new button { padding: 6px 0; font-size: 0.8rem; }

    body.plain .plain-sidebar-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 65;
    }

    body.plain .plain-sidebar-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 55;
      width: 38px;
      height: 38px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 1.1rem;
      cursor: pointer;
      border-radius: 4px;
    }
    body.plain .plain-sidebar-toggle:hover { color: var(--accent); border-color: var(--text-muted); }

    body.plain .plain-main { padding: 56px 16px 80px; }
    body.plain .plain-header-meta { flex-wrap: wrap; gap: 8px; row-gap: 4px; }
    body.plain .plain-header-actions { flex-wrap: wrap; row-gap: 8px; }
    body.plain .plain-tasks { padding-left: 10px; }
    body.plain .plain-task { padding: 6px 0; }
    body.plain .plain-task-check { font-size: 0.9rem; }
    body.plain .plain-add-task input { width: 100%; max-width: 220px; }
  }

  /* Search overlay */
  body.plain .detail-search { border-radius: 0; font-family: inherit; border: 1px solid var(--border); box-shadow: none; }
  body.plain .detail-search input { font-family: inherit; font-size: 0.78rem; }

  /* Hide topbar in plain mode */
  body.plain .topbar { display: none; }
  body.plain .app { display: none; }
`;
