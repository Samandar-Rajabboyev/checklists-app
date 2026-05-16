import { useState, useEffect, useCallback, useRef } from "react";

// ──── Constants & Schemes ─────────────────────────────────────────────────────

const ACCENT_COLORS = ["#D4522A", "#2A6DD4", "#2AA65A", "#8B2AD4", "#D4A22A"];

const SCHEMES = [
  {
    id: "notion-dark",
    name: "Notion Dark",
    bg: "#191919",
    bgCard: "#202020",
    bgHover: "#282828",
    text: "#E6E6E4",
    textMuted: "#828280",
    textPlaceholder: "#484846",
    border: "#303030",
    borderStrong: "#E6E6E4",
    phaseBar: "#E6E6E4",
    phaseBarText: "#191919",
    hintBg: "#111111",
    hintText: "#626260",
    hintKey: "#E6E6E4",
    hintKeyBg: "#282828",
    hintKeyBorder: "#3C3C3C",
    modalKbdBg: "#282828",
    modalKbdBorder: "#3C3C3C",
    overlayBg: "rgba(0,0,0,0.55)",
    overlayBgHeavy: "rgba(0,0,0,0.75)",
    accent: "#E6E6E4",
  },
  {
    id: "notion-dark-warm",
    name: "Notion Dark Warm",
    bg: "#1E1C1A",
    bgCard: "#262422",
    bgHover: "#2E2C28",
    text: "#E8E4DE",
    textMuted: "#847E76",
    textPlaceholder: "#4A4640",
    border: "#323028",
    borderStrong: "#E8E4DE",
    phaseBar: "#E8E4DE",
    phaseBarText: "#1E1C1A",
    hintBg: "#141210",
    hintText: "#646058",
    hintKey: "#E8E4DE",
    hintKeyBg: "#2E2C28",
    hintKeyBorder: "#3E3C36",
    modalKbdBg: "#2E2C28",
    modalKbdBorder: "#3E3C36",
    overlayBg: "rgba(10,8,6,0.6)",
    overlayBgHeavy: "rgba(10,8,6,0.78)",
    accent: "#C8A86A",
  },
  {
    id: "notion-dark-cool",
    name: "Notion Dark Cool",
    bg: "#1A1C1E",
    bgCard: "#222426",
    bgHover: "#2A2C30",
    text: "#E2E4E8",
    textMuted: "#7E8288",
    textPlaceholder: "#464A50",
    border: "#2E3236",
    borderStrong: "#E2E4E8",
    phaseBar: "#E2E4E8",
    phaseBarText: "#1A1C1E",
    hintBg: "#121416",
    hintText: "#606468",
    hintKey: "#E2E4E8",
    hintKeyBg: "#2A2C30",
    hintKeyBorder: "#3A3E44",
    modalKbdBg: "#2A2C30",
    modalKbdBorder: "#3A3E44",
    overlayBg: "rgba(8,10,12,0.6)",
    overlayBgHeavy: "rgba(8,10,12,0.78)",
    accent: "#7EB8D4",
  },
  {
    id: "notion",
    name: "Notion",
    bg: "#FFFFFF",
    bgCard: "#FBFBFA",
    bgHover: "#F1F0EF",
    text: "#37352F",
    textMuted: "#9B9A97",
    textPlaceholder: "#C7C6C4",
    border: "#E9E9E7",
    borderStrong: "#37352F",
    phaseBar: "#37352F",
    phaseBarText: "#FFFFFF",
    hintBg: "#2F2F2F",
    hintText: "#888580",
    hintKey: "#FFFFFF",
    hintKeyBg: "#454545",
    hintKeyBorder: "#555555",
    modalKbdBg: "#F1F0EF",
    modalKbdBorder: "#DDDDDD",
    overlayBg: "rgba(55,53,47,0.4)",
    overlayBgHeavy: "rgba(55,53,47,0.65)",
    accent: "#37352F",
  },
  {
    id: "notion-warm",
    name: "Notion Warm",
    bg: "#FAF8F5",
    bgCard: "#FFFFFF",
    bgHover: "#F0EDE8",
    text: "#37332C",
    textMuted: "#9A9590",
    textPlaceholder: "#C4BFB8",
    border: "#E8E4DE",
    borderStrong: "#37332C",
    phaseBar: "#37332C",
    phaseBarText: "#FAF8F5",
    hintBg: "#2C2822",
    hintText: "#847E78",
    hintKey: "#FAF8F5",
    hintKeyBg: "#42403A",
    hintKeyBorder: "#545048",
    modalKbdBg: "#F0EDE8",
    modalKbdBorder: "#D8D4CE",
    overlayBg: "rgba(44,40,34,0.45)",
    overlayBgHeavy: "rgba(44,40,34,0.65)",
    accent: "#9A7A4A",
  },
];

const applyScheme = (s) => {
  const r = document.documentElement.style;
  r.setProperty("--bg", s.bg);
  r.setProperty("--bg-card", s.bgCard);
  r.setProperty("--bg-hover", s.bgHover);
  r.setProperty("--text", s.text);
  r.setProperty("--text-muted", s.textMuted);
  r.setProperty("--text-placeholder", s.textPlaceholder);
  r.setProperty("--border", s.border);
  r.setProperty("--border-strong", s.borderStrong);
  r.setProperty("--phase-bar", s.phaseBar);
  r.setProperty("--phase-bar-text", s.phaseBarText);
  r.setProperty("--hint-bg", s.hintBg);
  r.setProperty("--hint-text", s.hintText);
  r.setProperty("--hint-key", s.hintKey);
  r.setProperty("--hint-key-bg", s.hintKeyBg);
  r.setProperty("--hint-key-border", s.hintKeyBorder);
  r.setProperty("--modal-kbd-bg", s.modalKbdBg);
  r.setProperty("--modal-kbd-border", s.modalKbdBorder);
  r.setProperty("--overlay-bg", s.overlayBg);
  r.setProperty("--overlay-bg-heavy", s.overlayBgHeavy);
  r.setProperty("--accent", s.accent);
};

const loadMode = () => ls.get("uimode") || "classic";
const saveMode = (m) => ls.set("uimode", m);

const uid = () => Math.random().toString(36).slice(2, 10);

const ls = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

const loadData = () => {
  try {
    const r = ls.get("checklists-v2");
    if (r) return JSON.parse(r);
    const v1 = ls.get("checklists-v1");
    if (v1) return JSON.parse(v1);
  } catch {}
  return [];
};
const saveData = (d) => ls.set("checklists-v2", JSON.stringify(d));
const loadView = () => ls.get("view") || "grid";
const saveView = (v) => ls.set("view", v);
const loadScheme = () => {
  const id = ls.get("scheme");
  return SCHEMES.find((s) => s.id === id) || SCHEMES[0];
};
const saveScheme = (s) => ls.set("scheme", s.id);

const getProgress = (cl) => {
  let done = 0,
    total = 0;
  for (const ph of cl.phases)
    for (const t of ph.tasks) {
      total++;
      if (t.done) done++;
    }
  return { done, total };
};

// ──── CSS ─────────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; min-height: 100vh; padding-bottom: 40px; }
  .serif { font-family: 'Fraunces', serif; font-weight: 600; }
  .app { max-width: 960px; margin: 0 auto; padding: 0 24px 60px; }

  /* Header */
  .header { display:flex; align-items:center; justify-content:space-between; padding:36px 0 18px; border-bottom:1.5px solid var(--border-strong); margin-bottom:24px; gap:12px; flex-wrap:wrap; }
  .header h1 { font-size:2.2rem; line-height:1; }
  .header-right { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

  /* Buttons */
  .btn { border:none; font-family:'DM Mono',monospace; font-size:0.72rem; cursor:pointer; padding:7px 13px; letter-spacing:0.04em; }
  .btn-dark { background:var(--border-strong); color:var(--bg); }
  .btn-dark:hover { opacity:0.85; }
  .btn-muted { background:none; border:1px solid var(--border); color:var(--text-muted); }
  .btn-muted:hover { border-color:var(--text-muted); color:var(--text); }

  /* Scheme picker */
  .scheme-picker { display:flex; gap:5px; align-items:center; }
  .scheme-dot { width:14px; height:14px; cursor:pointer; border-radius:50%; flex-shrink:0; transition:transform 0.1s; }
  .scheme-dot:hover { transform:scale(1.2); }
  .scheme-dot.active { outline:2px solid var(--text); outline-offset:2px; }

  /* Search bar on home */
  .search-bar { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
  .search-input { flex:1; background:var(--bg-card); border:1px solid var(--border); font-family:'DM Mono',monospace; font-size:0.82rem; padding:8px 12px; color:var(--text); outline:none; }
  .search-input:focus { border-color:var(--text-muted); }
  .search-clear { background:none; border:none; font-size:1rem; cursor:pointer; color:var(--text-muted); padding:0 4px; }
  .search-clear:hover { color:var(--accent); }

  /* Filter tabs */
  .filter-tabs { display:flex; border:1px solid var(--border); width:fit-content; }
  .filter-tab { background:none; border:none; border-right:1px solid var(--border); font-family:'DM Mono',monospace; font-size:0.66rem; padding:5px 13px; cursor:pointer; color:var(--text-muted); letter-spacing:0.04em; }
  .filter-tab:last-child { border-right:none; }
  .filter-tab.active { background:var(--border-strong); color:var(--bg); }

  /* View toggle */
  .view-toggle { display:flex; gap:4px; align-items:center; }
  .view-btn { background:none; border:1px solid var(--border); font-family:'DM Mono',monospace; font-size:0.66rem; padding:4px 10px; cursor:pointer; color:var(--text-muted); }
  .view-btn.active { background:var(--border-strong); color:var(--bg); border-color:var(--border-strong); }

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

  /* Keyhint bar */
  .keyhint-bar { position:fixed; bottom:0; left:0; right:0; background:var(--hint-bg); color:var(--hint-text); font-family:'DM Mono',monospace; font-size:0.61rem; padding:5px 18px; display:flex; gap:0; align-items:center; letter-spacing:0.03em; z-index:50; flex-wrap:wrap; overflow:hidden; }
  .keyhint-item { display:flex; align-items:center; gap:3px; padding:0 10px 0 0; }
  .keyhint-item:first-of-type { padding-left: 10px; border-left: 1px solid var(--hint-key-border); }
  .keyhint-label { color:var(--hint-text); }
  .keyhint-bar kbd { color:var(--hint-key); background:var(--hint-key-bg); padding:1px 5px; border:1px solid var(--hint-key-border); font-family:'DM Mono',monospace; font-size:0.6rem; }
  .keyhint-mode { color:var(--accent); font-size:0.63rem; letter-spacing:0.08em; padding-right:10px; flex-shrink:0; }

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
`;

const modernStyles = `
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
  body.modern .mode-toggle { background: none; padding: 0; gap: 0; border-radius: 0; }
  body.modern .mode-btn { font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 500; padding: 4px 10px; border-radius: 5px; background: none; color: var(--text-muted); letter-spacing: 0; }
  body.modern .mode-btn.active { background: var(--bg-hover); color: var(--text); box-shadow: none; }

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
    font-size: 0.62rem;
    padding: 7px 32px;
    gap: 0;
    opacity: 1;
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

// ──── Confetti ────────────────────────────────────────────────────────────────

function Confetti({ onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 5,
      rot: Math.random() * 360,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 3,
      vr: (Math.random() - 0.5) * 6,
      color: ["#D4522A", "#C8A86A", "#7EB8D4", "#9B9A97", "#E8E4DE"][
        Math.floor(Math.random() * 5)
      ],
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.05;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) frame = requestAnimationFrame(draw);
      else onDone();
    };
    frame = requestAnimationFrame(draw);
    if (navigator.vibrate) navigator.vibrate([80, 60, 80, 60, 120]);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        pointerEvents: "none",
      }}
    />
  );
}

// ──── KeyHintBar ──────────────────────────────────────────────────────────────

function KeyHintBar({ hints, mode = "NORMAL" }) {
  return (
    <div className="keyhint-bar">
      <span className="keyhint-mode">{mode}</span>
      {hints.map((h, i) => (
        <span key={i} className="keyhint-item">
          <kbd>{h.key}</kbd>
          <span className="keyhint-label">{h.label}</span>
        </span>
      ))}
    </div>
  );
}

// ──── HelpOverlay ─────────────────────────────────────────────────────────────

function HelpOverlay({ onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" || e.key === "?") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const section = (title, rows) => (
    <div className="help-section">
      <div className="help-section-title">{title}</div>
      {rows.map(([k, d]) => (
        <div className="help-row" key={k}>
          <kbd>{k}</kbd>
          <span>{d}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div
      className="help-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="help-box">
        <div className="help-title serif">Keyboard Shortcuts</div>
        {section("Home", [
          ["j/k", "navigate"],
          ["h/l", "grid columns"],
          ["Enter", "open"],
          ["n", "new"],
          ["i", "import JSON"],
          ["T", "cycle theme"],
          ["v", "cycle view"],
          ["Tab", "filter tab"],
          ["?", "help"],
        ])}
        {section("Detail", [
          ["j/k", "move between tasks"],
          ["V", "visual mode"],
          ["J/K", "reorder task"],
          ["H/L", "move to prev/next phase"],
          ["[/]", "reorder phase up/down"],
          ["z", "toggle phase collapse"],
          ["x · Enter", "toggle done"],
          ["P", "toggle whole phase"],
          ["dd", "delete task (then y/n)"],
          ["e", "edit"],
          ["a", "archive"],
          ["E", "export JSON"],
          ["d", "delete checklist"],
          ["b · Esc", "back"],
          ["Ctrl+D", "half page down"],
          ["Ctrl+U", "half page up"],
          ["/", "search tasks"],
          ["n/N", "next/prev match"],
          ["?", "help"],
        ])}
        {section("Visual Mode (multi-select)", [
          ["j/k", "extend selection"],
          ["x", "toggle all"],
          ["J/K", "move all up/down"],
          ["H/L", "move all to prev/next phase"],
          ["dd", "delete selected"],
          ["V · Esc", "exit"],
        ])}
        {section("Modal", [
          ["Tab", "next field"],
          ["Ctrl+Enter", "save"],
          ["Ctrl+P", "add phase"],
          ["Ctrl+T", "add task"],
          ["↑/↓ buttons", "reorder phases"],
          ["Esc", "close"],
        ])}
        <div className="help-close">
          press <kbd>?</kbd> or <kbd>Esc</kbd> to close
        </div>
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

// ──── Home ────────────────────────────────────────────────────────────────────

function Home({
  checklists,
  onSelect,
  onNew,
  onImport,
  scheme,
  onCycleScheme,
  uiMode,
  onToggleMode,
}) {
  const [focusIdx, setFocusIdx] = useState(0);
  const [view, setView] = useState(loadView);
  const [filter, setFilter] = useState("active"); // active | all | archived
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [importErr, setImportErr] = useState("");
  const fileRef = useRef(null);
  const searchRef = useRef(null);

  const setAndSaveView = (v) => {
    setView(v);
    saveView(v);
  };

  const filtered = checklists.filter((cl) => {
    if (filter === "active" && cl.archived) return false;
    if (filter === "archived" && !cl.archived) return false;
    if (search && !cl.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const items = Array.isArray(data) ? data : [data];
        for (const it of items) {
          if (!it.title || !Array.isArray(it.phases))
            throw new Error("invalid");
          if (!it.id) it.id = uid();
        }
        onImport(items);
        setImportErr("");
      } catch {
        setImportErr("Invalid JSON");
        setTimeout(() => setImportErr(""), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  useEffect(() => {
    const h = (e) => {
      if (showSearch) {
        if (e.key === "Escape") {
          setShowSearch(false);
          setSearch("");
        }
        return;
      }
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      )
        return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "l" || e.key === "ArrowRight") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 2, filtered.length - 1));
      } else if (e.key === "h" || e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 2, 0));
      } else if ((e.key === "Enter" || e.key === " ") && filtered[focusIdx]) {
        e.preventDefault();
        onSelect(filtered[focusIdx].id);
      } else if (e.key === "n") {
        e.preventDefault();
        onNew();
      } else if (e.key === "i") {
        e.preventDefault();
        fileRef.current?.click();
      } else if (e.key === "T") {
        e.preventDefault();
        onCycleScheme();
      } else if (e.key === "M") {
        e.preventDefault();
        onToggleMode();
      } else if (e.key === "v") {
        e.preventDefault();
        setAndSaveView((v) =>
          v === "grid" ? "list" : v === "list" ? "compact" : "grid",
        );
      } else if (e.key === "Tab") {
        e.preventDefault();
        setFilter((f) =>
          f === "active" ? "all" : f === "all" ? "archived" : "active",
        );
      } else if (e.key === "/") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 30);
      } else if (e.key === "?") {
        /* handled globally */
      } else if (e.key === "g") setFocusIdx(0);
      else if (e.key === "G") setFocusIdx(filtered.length - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [filtered, focusIdx, onSelect, onNew, showSearch]);

  const ProgressBar = ({ cl }) => {
    const { done, total } = getProgress(cl);
    const pct = total ? (done / total) * 100 : 0;
    return (
      <>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{
              width: `${pct}%`,
              background: cl.color || "var(--accent)",
            }}
          />
        </div>
        <div className="progress-label">
          {done}/{total} complete
        </div>
      </>
    );
  };

  const hints = showSearch
    ? [{ key: "Esc", label: "close search" }]
    : [
        { key: "j/k", label: "navigate" },
        { key: "Enter", label: "open" },
        { key: "n", label: "new" },
        { key: "i", label: "import" },
        { key: "T", label: "theme" },
        { key: "M", label: "mode" },
        { key: "v", label: `view:${view}` },
        { key: "Tab", label: `filter:${filter}` },
        { key: "/", label: "search" },
        { key: "?", label: "help" },
      ];

  return (
    <div className="app">
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="header">
        <h1 className="serif">Checklists</h1>
        <div className="header-right">
          {importErr && <span className="err-msg">{importErr}</span>}
          <div className="scheme-picker">
            {SCHEMES.map((s) => (
              <div
                key={s.id}
                className={`scheme-dot${s.id === scheme?.id ? " active" : ""}`}
                style={{
                  background: s.bg,
                  border: `2px solid ${s.borderStrong}`,
                }}
                title={s.name}
                onClick={() => onCycleScheme(s)}
              />
            ))}
          </div>
          <div className="mode-toggle">
            <button
              className={`mode-btn${uiMode === "classic" ? " active" : ""}`}
              onClick={() => uiMode !== "classic" && onToggleMode()}
            >
              classic
            </button>
            <button
              className={`mode-btn${uiMode === "modern" ? " active" : ""}`}
              onClick={() => uiMode !== "modern" && onToggleMode()}
            >
              modern
            </button>
          </div>
          <button
            className="btn btn-muted"
            onClick={() => fileRef.current?.click()}
          >
            ↑ Import
          </button>
          <button className="btn btn-dark" onClick={onNew}>
            + New
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div className="filter-tabs">
          {["active", "all", "archived"].map((f) => (
            <button
              key={f}
              className={`filter-tab${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          {["grid", "list", "compact"].map((v) => (
            <button
              key={v}
              className={`view-btn${view === v ? " active" : ""}`}
              onClick={() => setAndSaveView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {showSearch && (
        <div className="search-bar">
          <input
            ref={searchRef}
            className="search-input"
            value={search}
            placeholder="Search checklists…"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowSearch(false);
                setSearch("");
              }
            }}
          />
          <button
            className="search-clear"
            onClick={() => {
              setShowSearch(false);
              setSearch("");
            }}
          >
            ×
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          No checklists. Press <kbd>n</kbd> to create one.
        </div>
      ) : view === "grid" ? (
        <div className="grid">
          {filtered.map((cl, idx) => (
            <div
              key={cl.id}
              className={`card${focusIdx === idx ? " focused" : ""}${cl.archived ? " card-archived" : ""}`}
              onClick={() => {
                setFocusIdx(idx);
                onSelect(cl.id);
              }}
              onMouseEnter={() => setFocusIdx(idx)}
            >
              <div className="card-emoji">{cl.emoji}</div>
              <div className="card-title serif">{cl.title}</div>
              {cl.description && (
                <div className="card-desc">{cl.description}</div>
              )}
              <ProgressBar cl={cl} />
              <div className="card-meta">
                {cl.total_days && (
                  <span className="card-duration">~{cl.total_days} days</span>
                )}
                {cl.archived && (
                  <span className="card-archived-badge">ARCHIVED</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : view === "list" ? (
        <div className="list-view">
          {filtered.map((cl, idx) => {
            const { done, total } = getProgress(cl);
            const pct = total ? (done / total) * 100 : 0;
            return (
              <div
                key={cl.id}
                className={`list-card${focusIdx === idx ? " focused" : ""}${cl.archived ? " card-archived" : ""}`}
                onClick={() => {
                  setFocusIdx(idx);
                  onSelect(cl.id);
                }}
                onMouseEnter={() => setFocusIdx(idx)}
              >
                <span className="list-card-emoji">{cl.emoji}</span>
                <div className="list-card-body">
                  <div className="list-card-title serif">{cl.title}</div>
                  {cl.description && (
                    <div className="list-card-desc">{cl.description}</div>
                  )}
                </div>
                <div className="list-card-right">
                  <div className="progress-bar-bg" style={{ width: 80 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: cl.color || "var(--accent)",
                      }}
                    />
                  </div>
                  <div className="progress-label">
                    {done}/{total}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="compact-view">
          {filtered.map((cl, idx) => {
            const { done, total } = getProgress(cl);
            const pct = total ? (done / total) * 100 : 0;
            return (
              <div
                key={cl.id}
                className={`compact-card${focusIdx === idx ? " focused" : ""}${cl.archived ? " card-archived" : ""}`}
                onClick={() => {
                  setFocusIdx(idx);
                  onSelect(cl.id);
                }}
                onMouseEnter={() => setFocusIdx(idx)}
              >
                <span className="compact-card-emoji">{cl.emoji}</span>
                <span className="compact-card-title">{cl.title}</span>
                <div
                  className="progress-bar-bg"
                  style={{ width: 60, marginBottom: 0 }}
                >
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: cl.color || "var(--accent)",
                    }}
                  />
                </div>
                <span className="compact-progress-text">
                  {done}/{total}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <KeyHintBar hints={hints} />
    </div>
  );
}

// ──── Detail ──────────────────────────────────────────────────────────────────

function Detail({
  checklist,
  onChange,
  onBack,
  onEdit,
  onDelete,
  onArchive,
  onExport,
  modalOpen,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmTaskDelete, setConfirmTaskDelete] = useState(false);
  const [addingTask, setAddingTask] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [searchIdx, setSearchIdx] = useState(0);
  const [visualMode, setVisualMode] = useState(false);
  const [visualAnchor, setVisualAnchor] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [ddPending, setDdPending] = useState(false);
  const ddTimer = useRef(null);
  const searchRef = useRef(null);
  const focusRef = useRef(null);
  const prevDone = useRef(null);

  // Collapsible phases — completed phases start collapsed
  const [collapsedPhases, setCollapsedPhases] = useState(() => {
    const s = new Set();
    checklist.phases.forEach((ph) => {
      if (ph.tasks.length > 0 && ph.tasks.every((t) => t.done)) s.add(ph.id);
    });
    return s;
  });
  const toggleCollapse = (id) =>
    setCollapsedPhases((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // Flat item list for keyboard nav (tasks + add-buttons, skipping collapsed)
  const allItems = checklist.phases.flatMap((ph) => [
    ...(!collapsedPhases.has(ph.id)
      ? ph.tasks.map((t) => ({ type: "task", phaseId: ph.id, taskId: t.id }))
      : []),
    { type: "add", phaseId: ph.id },
  ]);

  const [focusIdx, setFocusIdx] = useState(0);

  // Search matches
  const searchMatches = (() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const ms = [];
    checklist.phases.forEach((ph) => {
      if (
        ph.label.toLowerCase().includes(q) ||
        ph.title.toLowerCase().includes(q)
      )
        ms.push({ type: "phase", phaseId: ph.id });
      ph.tasks.forEach((t) => {
        if (t.text.toLowerCase().includes(q))
          ms.push({ type: "task", phaseId: ph.id, taskId: t.id });
      });
    });
    return ms;
  })();

  const currentMatch = searchMatches[searchIdx];

  // Scroll to match
  useEffect(() => {
    if (!currentMatch) return;
    if (currentMatch.type === "task") {
      const idx = allItems.findIndex(
        (it) => it.type === "task" && it.taskId === currentMatch.taskId,
      );
      if (idx !== -1) setFocusIdx(idx);
    }
    setTimeout(() => {
      const el =
        currentMatch.type === "phase"
          ? document.querySelector(`[data-phase-id="${currentMatch.phaseId}"]`)
          : document.querySelector(`[data-task-id="${currentMatch.taskId}"]`);
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 30);
  }, [searchIdx, search]);

  // Confetti when 100%
  const { done, total } = getProgress(checklist);
  useEffect(() => {
    if (
      prevDone.current !== null &&
      prevDone.current < total &&
      done === total &&
      total > 0
    )
      setShowConfetti(true);
    prevDone.current = done;
  }, [done, total]);

  // Auto-scroll focused item into view
  useEffect(() => {
    if (focusRef.current)
      focusRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusIdx]);

  const pct = total ? (done / total) * 100 : 0;
  const accent = checklist.color || "var(--accent)";

  // ── Data mutations ─────────────────────────────────────────────────────────

  const toggleTask = (phaseId, taskId) => {
    const newPhases = checklist.phases.map((ph) =>
      ph.id !== phaseId
        ? ph
        : {
            ...ph,
            tasks: ph.tasks.map((t) =>
              t.id !== taskId ? t : { ...t, done: !t.done },
            ),
          },
    );
    onChange({ ...checklist, phases: newPhases });
    const ph = newPhases.find((p) => p.id === phaseId);
    if (ph && ph.tasks.every((t) => t.done))
      setTimeout(
        () =>
          setCollapsedPhases((s) => {
            const n = new Set(s);
            n.add(phaseId);
            return n;
          }),
        400,
      );
    else
      setCollapsedPhases((s) => {
        const n = new Set(s);
        n.delete(phaseId);
        return n;
      });
  };

  const togglePhase = (phaseId) => {
    const ph = checklist.phases.find((p) => p.id === phaseId);
    if (!ph) return;
    const allDone = ph.tasks.every((t) => t.done);
    onChange({
      ...checklist,
      phases: checklist.phases.map((p) =>
        p.id !== phaseId
          ? p
          : { ...p, tasks: p.tasks.map((t) => ({ ...t, done: !allDone })) },
      ),
    });
  };

  const moveTask = (taskId, fromPhaseId, dir) => {
    const phases = checklist.phases;
    const pi = phases.findIndex((p) => p.id === fromPhaseId);
    const ti = phases[pi].tasks.findIndex((t) => t.id === taskId);
    const task = phases[pi].tasks[ti];
    let newPhases;
    if (dir === "up" || dir === "down") {
      const ni = dir === "up" ? ti - 1 : ti + 1;
      if (ni < 0 || ni >= phases[pi].tasks.length) return;
      const tasks = [...phases[pi].tasks];
      tasks.splice(ti, 1);
      tasks.splice(ni, 0, task);
      newPhases = phases.map((p) =>
        p.id !== fromPhaseId ? p : { ...p, tasks },
      );
    } else {
      const tpi = dir === "left" ? pi - 1 : pi + 1;
      if (tpi < 0 || tpi >= phases.length) return;
      newPhases = phases.map((p, i) => {
        if (p.id === fromPhaseId)
          return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
        if (i === tpi)
          return {
            ...p,
            tasks: dir === "left" ? [...p.tasks, task] : [task, ...p.tasks],
          };
        return p;
      });
    }
    onChange({ ...checklist, phases: newPhases });
    setTimeout(() => {
      const nai = newPhases.flatMap((ph) => [
        ...ph.tasks.map((t) => ({
          type: "task",
          phaseId: ph.id,
          taskId: t.id,
        })),
        { type: "add", phaseId: ph.id },
      ]);
      const ni = nai.findIndex(
        (it) => it.type === "task" && it.taskId === taskId,
      );
      if (ni !== -1) setFocusIdx(ni);
    }, 0);
  };

  const deleteTask = () => {
    if (visualMode && selected.size > 0) {
      const ids = selected;
      onChange({
        ...checklist,
        phases: checklist.phases.map((ph) => ({
          ...ph,
          tasks: ph.tasks.filter((t) => !ids.has(t.id)),
        })),
      });
      exitVisualMode();
    } else {
      const item = allItems[focusIdx];
      if (!item || item.type !== "task") return;
      onChange({
        ...checklist,
        phases: checklist.phases.map((ph) =>
          ph.id !== item.phaseId
            ? ph
            : { ...ph, tasks: ph.tasks.filter((t) => t.id !== item.taskId) },
        ),
      });
      setFocusIdx((i) => Math.max(0, i - 1));
    }
    setConfirmTaskDelete(false);
    setDdPending(false);
  };

  const commitNewTask = (phaseId, text) => {
    if (!text?.trim()) {
      setAddingTask(null);
      return;
    }
    onChange({
      ...checklist,
      phases: checklist.phases.map((ph) =>
        ph.id !== phaseId
          ? ph
          : {
              ...ph,
              tasks: [
                ...ph.tasks,
                { id: uid(), text: text.trim(), done: false },
              ],
            },
      ),
    });
    setAddingTask(null);
  };

  // ── Visual mode ────────────────────────────────────────────────────────────

  const enterVisualMode = (idx) => {
    const item = allItems[idx];
    if (!item || item.type !== "task") return;
    setVisualMode(true);
    setVisualAnchor(idx);
    setSelected(new Set([item.taskId]));
  };
  const exitVisualMode = () => {
    setVisualMode(false);
    setVisualAnchor(null);
    setSelected(new Set());
  };

  const updateVisualSelection = (nfi) => {
    if (!visualMode || visualAnchor === null) return;
    const lo = Math.min(visualAnchor, nfi),
      hi = Math.max(visualAnchor, nfi);
    const ids = new Set();
    for (let i = lo; i <= hi; i++)
      if (allItems[i]?.type === "task") ids.add(allItems[i].taskId);
    setSelected(ids);
  };

  const getSelectedTasks = () =>
    allItems.filter((it) => it.type === "task" && selected.has(it.taskId));

  const moveSelected = (dir) => {
    const sel = getSelectedTasks();
    if (!sel.length) return;
    let phases = checklist.phases.map((ph) => ({
      ...ph,
      tasks: [...ph.tasks],
    }));
    if (dir === "up") {
      for (const { taskId, phaseId } of sel) {
        const ph = phases.find((p) => p.id === phaseId);
        const i = ph.tasks.findIndex((t) => t.id === taskId);
        if (i <= 0) return;
        const t = ph.tasks.splice(i, 1)[0];
        ph.tasks.splice(i - 1, 0, t);
      }
    } else if (dir === "down") {
      for (const { taskId, phaseId } of [...sel].reverse()) {
        const ph = phases.find((p) => p.id === phaseId);
        const i = ph.tasks.findIndex((t) => t.id === taskId);
        if (i >= ph.tasks.length - 1) return;
        const t = ph.tasks.splice(i, 1)[0];
        ph.tasks.splice(i + 1, 0, t);
      }
    } else if (dir === "left" || dir === "right") {
      const ids = new Set(sel.map((s) => s.taskId));
      const fpi = phases.findIndex((p) => p.id === sel[0].phaseId);
      if (sel.some((s) => s.phaseId !== sel[0].phaseId)) return;
      const tpi = dir === "left" ? fpi - 1 : fpi + 1;
      if (tpi < 0 || tpi >= phases.length) return;
      const mt = phases[fpi].tasks.filter((t) => ids.has(t.id));
      phases[fpi].tasks = phases[fpi].tasks.filter((t) => !ids.has(t.id));
      if (dir === "left") phases[tpi].tasks = [...phases[tpi].tasks, ...mt];
      else phases[tpi].tasks = [...mt, ...phases[tpi].tasks];
    }
    onChange({ ...checklist, phases });
    setTimeout(() => {
      const nai = phases.flatMap((ph) => [
        ...ph.tasks.map((t) => ({
          type: "task",
          phaseId: ph.id,
          taskId: t.id,
        })),
        { type: "add", phaseId: ph.id },
      ]);
      const indices = nai
        .map((it, i) =>
          it.type === "task" && selected.has(it.taskId) ? i : -1,
        )
        .filter((i) => i !== -1);
      if (indices.length) {
        const nf =
          dir === "up" || dir === "left"
            ? indices[0]
            : indices[indices.length - 1];
        setFocusIdx(nf);
        setVisualAnchor(
          dir === "up" || dir === "left"
            ? indices[indices.length - 1]
            : indices[0],
        );
      }
    }, 0);
  };

  // ── Drag state ─────────────────────────────────────────────────────────────

  const dragTask = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const handleDrop = (e, targetTaskId, targetPhaseId, atEnd) => {
    e.preventDefault();
    if (!dragTask.current) return;
    const isMulti = !!dragTask.current.selectedIds;
    const srcPhase = dragTask.current.phaseId;
    let newPhases;
    if (isMulti) {
      const ids = dragTask.current.selectedIds;
      const srcPh = checklist.phases.find((p) => p.id === srcPhase);
      const movingTasks = srcPh.tasks.filter((t) => ids.has(t.id));
      newPhases = checklist.phases.map((p) =>
        p.id === srcPhase
          ? { ...p, tasks: p.tasks.filter((t) => !ids.has(t.id)) }
          : p,
      );
      newPhases = newPhases.map((p) =>
        p.id !== targetPhaseId
          ? p
          : {
              ...p,
              tasks: (() => {
                const arr = [...p.tasks];
                if (atEnd) arr.push(...movingTasks);
                else {
                  const i = arr.findIndex((t) => t.id === targetTaskId);
                  arr.splice(i, 0, ...movingTasks);
                }
                return arr;
              })(),
            },
      );
    } else {
      const srcId = dragTask.current.taskId;
      if (srcId === targetTaskId) {
        setDragOver(null);
        return;
      }
      const srcPh = checklist.phases.find((p) => p.id === srcPhase);
      const mt = srcPh.tasks.find((t) => t.id === srcId);
      newPhases = checklist.phases.map((p) =>
        p.id === srcPhase
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== srcId) }
          : p,
      );
      newPhases = newPhases.map((p) =>
        p.id !== targetPhaseId
          ? p
          : {
              ...p,
              tasks: (() => {
                const arr = [...p.tasks];
                if (atEnd) arr.push(mt);
                else {
                  const i = arr.findIndex((t) => t.id === targetTaskId);
                  arr.splice(i, 0, mt);
                }
                return arr;
              })(),
            },
      );
    }
    onChange({ ...checklist, phases: newPhases });
    dragTask.current = null;
    setDragOver(null);
  };

  // ── Keyboard ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const h = (e) => {
      if (modalOpen) return;

      // When search input is focused, let typing happen naturally.
      // Only intercept Esc (to close) — n/N navigation is handled in the input's onKeyDown.
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        if (showSearch && e.key === "Escape") {
          e.preventDefault();
          setShowSearch(false);
          setSearch("");
        }
        return;
      }

      // n/N match navigation when search is open but input is NOT focused
      if (showSearch) {
        if (e.key === "Escape") {
          setShowSearch(false);
          setSearch("");
          return;
        }
        if (e.key === "n") {
          e.preventDefault();
          setSearchIdx((i) => (i + 1) % Math.max(searchMatches.length, 1));
          return;
        }
        if (e.key === "N") {
          e.preventDefault();
          setSearchIdx(
            (i) =>
              (i - 1 + Math.max(searchMatches.length, 1)) %
              Math.max(searchMatches.length, 1),
          );
          return;
        }
      }
      const item = allItems[focusIdx];

      // Visual mode
      if (visualMode) {
        if (e.key === "j" || e.key === "ArrowDown") {
          e.preventDefault();
          const n = Math.min(focusIdx + 1, allItems.length - 1);
          setFocusIdx(n);
          updateVisualSelection(n);
        } else if (e.key === "k" || e.key === "ArrowUp") {
          e.preventDefault();
          const n = Math.max(focusIdx - 1, 0);
          setFocusIdx(n);
          updateVisualSelection(n);
        } else if (e.key === "x" || e.key === "Enter") {
          e.preventDefault();
          const sel = getSelectedTasks();
          const allDone = sel.every((s) => {
            const ph = checklist.phases.find((p) => p.id === s.phaseId);
            return ph?.tasks.find((t) => t.id === s.taskId)?.done;
          });
          let phases = checklist.phases;
          for (const { phaseId, taskId } of sel)
            phases = phases.map((ph) =>
              ph.id !== phaseId
                ? ph
                : {
                    ...ph,
                    tasks: ph.tasks.map((t) =>
                      t.id !== taskId ? t : { ...t, done: !allDone },
                    ),
                  },
            );
          onChange({ ...checklist, phases });
        } else if (e.key === "J") {
          e.preventDefault();
          moveSelected("down");
        } else if (e.key === "K") {
          e.preventDefault();
          moveSelected("up");
        } else if (e.key === "H") {
          e.preventDefault();
          moveSelected("left");
        } else if (e.key === "L") {
          e.preventDefault();
          moveSelected("right");
        } else if (e.key === "d") {
          e.preventDefault();
          if (confirmTaskDelete) deleteTask();
          else if (ddPending) {
            clearTimeout(ddTimer.current);
            setDdPending(false);
            setConfirmTaskDelete(true);
          } else {
            setDdPending(true);
            ddTimer.current = setTimeout(() => setDdPending(false), 400);
          }
        } else if (e.key === "y" && confirmTaskDelete) {
          e.preventDefault();
          deleteTask();
        } else if (e.key === "n" && confirmTaskDelete) {
          e.preventDefault();
          setConfirmTaskDelete(false);
          setDdPending(false);
        } else if (e.key === "V" || e.key === "Escape") {
          e.preventDefault();
          if (confirmTaskDelete) {
            setConfirmTaskDelete(false);
            setDdPending(false);
          } else exitVisualMode();
        }
        return;
      }

      // Normal mode
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.5, behavior: "smooth" });
      } else if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.5, behavior: "smooth" });
      } else if (
        (e.key === "Enter" || e.key === " " || e.key === "x") &&
        item
      ) {
        e.preventDefault();
        if (item.type === "task") toggleTask(item.phaseId, item.taskId);
        if (item.type === "add") setAddingTask(item.phaseId);
      } else if (e.key === "V" && item?.type === "task") {
        e.preventDefault();
        enterVisualMode(focusIdx);
      } else if (e.key === "Escape" || e.key === "b") {
        e.preventDefault();
        if (confirmDelete) setConfirmDelete(false);
        else if (confirmTaskDelete) {
          setConfirmTaskDelete(false);
          setDdPending(false);
        } else onBack();
      } else if (e.key === "e") {
        e.preventDefault();
        onEdit();
      } else if (e.key === "d" && !confirmDelete) {
        e.preventDefault();
        if (confirmTaskDelete) deleteTask();
        else if (ddPending) {
          clearTimeout(ddTimer.current);
          setDdPending(false);
          setConfirmTaskDelete(true);
        } else {
          setDdPending(true);
          ddTimer.current = setTimeout(() => {
            setDdPending(false);
            setConfirmDelete(true);
          }, 400);
        }
      } else if (e.key === "y" && confirmDelete) {
        e.preventDefault();
        onDelete();
      } else if (e.key === "n" && confirmDelete) {
        e.preventDefault();
        setConfirmDelete(false);
      } else if (e.key === "y" && confirmTaskDelete) {
        e.preventDefault();
        deleteTask();
      } else if (e.key === "n" && confirmTaskDelete) {
        e.preventDefault();
        setConfirmTaskDelete(false);
        setDdPending(false);
      } else if (e.key === "P" && item) {
        e.preventDefault();
        togglePhase(item.phaseId);
      } else if (e.key === "J" && item?.type === "task") {
        e.preventDefault();
        moveTask(item.taskId, item.phaseId, "down");
      } else if (e.key === "K" && item?.type === "task") {
        e.preventDefault();
        moveTask(item.taskId, item.phaseId, "up");
      } else if (e.key === "H" && item?.type === "task") {
        e.preventDefault();
        moveTask(item.taskId, item.phaseId, "left");
      } else if (e.key === "L" && item?.type === "task") {
        e.preventDefault();
        moveTask(item.taskId, item.phaseId, "right");
      } else if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        if (!item) return;
        const phases = checklist.phases;
        const pi = phases.findIndex((p) => p.id === item.phaseId);
        const ti = e.key === "[" ? pi - 1 : pi + 1;
        if (ti < 0 || ti >= phases.length) return;
        const np = [...phases];
        [np[pi], np[ti]] = [np[ti], np[pi]];
        onChange({ ...checklist, phases: np });
        const tid = item.taskId;
        setTimeout(() => {
          const nai = np.flatMap((ph) => [
            ...ph.tasks.map((t) => ({
              type: "task",
              phaseId: ph.id,
              taskId: t.id,
            })),
            { type: "add", phaseId: ph.id },
          ]);
          const ni = nai.findIndex(
            (it) => it.type === "task" && it.taskId === tid,
          );
          if (ni !== -1) setFocusIdx(ni);
        }, 0);
      } else if (e.key === "a") {
        e.preventDefault();
        onArchive();
      } else if (e.key === "E") {
        e.preventDefault();
        onExport();
      } else if (e.key === "/") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 30);
      } else if (e.key === "z") {
        e.preventDefault();
        if (item) toggleCollapse(item.phaseId);
      } else if (e.key === "g") setFocusIdx(0);
      else if (e.key === "G") setFocusIdx(allItems.length - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [
    allItems,
    focusIdx,
    confirmDelete,
    confirmTaskDelete,
    ddPending,
    visualMode,
    visualAnchor,
    selected,
    showSearch,
    searchMatches,
    searchIdx,
    modalOpen,
    checklist,
  ]);

  const mode = visualMode ? `VISUAL (${selected.size})` : "NORMAL";
  const hints = confirmTaskDelete
    ? [
        {
          key: "dd/y",
          label: `delete ${visualMode ? selected.size + " tasks" : "task"}`,
        },
        { key: "n/Esc", label: "cancel" },
      ]
    : confirmDelete
      ? [
          { key: "y", label: "confirm delete" },
          { key: "n/Esc", label: "cancel" },
        ]
      : showSearch
        ? [
            {
              key: "n/N",
              label: `match ${searchMatches.length ? searchIdx + 1 : 0}/${searchMatches.length}`,
            },
            { key: "Esc", label: "close" },
          ]
        : visualMode
          ? [
              { key: "j/k", label: "extend" },
              { key: "J/K", label: "move" },
              { key: "H/L", label: "phase" },
              { key: "x", label: "toggle all" },
              { key: "dd", label: "delete" },
              { key: "V/Esc", label: "exit" },
            ]
          : [
              { key: "j/k", label: "move" },
              { key: "V", label: "visual" },
              { key: "J/K", label: "reorder" },
              { key: "H/L", label: "phase" },
              { key: "[/]", label: "move phase" },
              { key: "x", label: "toggle" },
              { key: "dd", label: "del task" },
              { key: "P", label: "phase done" },
              { key: "z", label: "fold" },
              { key: "/", label: "search" },
              { key: "e", label: "edit" },
              { key: "a", label: checklist.archived ? "unarchive" : "archive" },
              { key: "E", label: "export" },
              { key: "d", label: "del list" },
              { key: "b/Esc", label: "back" },
              { key: "?", label: "help" },
            ];

  return (
    <div className="app">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {showSearch && (
        <div className="detail-search">
          <span className="detail-search-icon">⌕</span>
          <input
            ref={searchRef}
            value={search}
            placeholder="Search phases & tasks…"
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setShowSearch(false);
                setSearch("");
              } else if (e.key === "Enter") {
                e.preventDefault();
                setSearchIdx(
                  (i) => (i + 1) % Math.max(searchMatches.length, 1),
                );
              }
            }}
          />
          {search && (
            <span className="detail-search-info">
              {searchMatches.length
                ? `${searchIdx + 1}/${searchMatches.length}`
                : "no match"}
            </span>
          )}
          <button
            className="detail-search-close"
            onClick={() => {
              setShowSearch(false);
              setSearch("");
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-title-row">
            <div className="detail-back-row">
              <button className="back-btn" onClick={onBack}>
                ←
              </button>
              <h1
                className="serif"
                style={{ fontSize: "1.8rem", lineHeight: 1 }}
              >
                {checklist.emoji} {checklist.title}
              </h1>
            </div>
            {checklist.description && (
              <div className="detail-subtitle">{checklist.description}</div>
            )}
          </div>
          {confirmDelete ? (
            <div className="confirm-delete">
              Delete checklist?&nbsp;
              <button className="confirm-btn yes" onClick={onDelete}>
                yes
              </button>
              <button
                className="confirm-btn"
                onClick={() => setConfirmDelete(false)}
              >
                cancel
              </button>
            </div>
          ) : (
            <div className="detail-actions">
              <button className="action-btn" onClick={onEdit}>
                [edit]
              </button>
              <button className="action-btn" onClick={onArchive}>
                [{checklist.archived ? "unarchive" : "archive"}]
              </button>
              <button className="action-btn" onClick={onExport}>
                [export]
              </button>
              <button
                className="action-btn danger"
                onClick={() => setConfirmDelete(true)}
              >
                [delete]
              </button>
            </div>
          )}
        </div>
        <div className="progress-label-large">
          {done} / {total} complete
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%`, background: accent }}
          />
        </div>
      </div>

      {checklist.phases.map((ph) => {
        const isCollapsed = collapsedPhases.has(ph.id);
        const isSearchMatch =
          search &&
          (ph.label.toLowerCase().includes(search.toLowerCase()) ||
            ph.title.toLowerCase().includes(search.toLowerCase()));
        return (
          <div className="phase-section" key={ph.id}>
            <div
              className="phase-label"
              data-phase-id={ph.id}
              style={
                isSearchMatch
                  ? {
                      outline: "2px solid var(--accent)",
                      outlineOffset: "-2px",
                    }
                  : {}
              }
              onClick={() => toggleCollapse(ph.id)}
            >
              <span>●</span>
              <span>
                {ph.label}
                {ph.title ? ` — ${ph.title}` : ""}
                {ph.duration ? ` · ${ph.duration}` : ""}
              </span>
              <span className="phase-collapse-icon">
                {isCollapsed ? "▶" : "▼"}
              </span>
            </div>

            {isCollapsed ? (
              <div className="phase-done-summary">
                {(() => {
                  const done = ph.tasks.filter((t) => t.done).length;
                  const total = ph.tasks.length;
                  const allDone = done === total;
                  return allDone
                    ? `✓ ${total} tasks complete — click to expand`
                    : `${done}/${total} tasks complete — click to expand`;
                })()}
              </div>
            ) : (
              <>
                <div className="tasks-list">
                  {ph.tasks.map((task) => {
                    const flatIdx = allItems.findIndex(
                      (it) => it.type === "task" && it.taskId === task.id,
                    );
                    const isFocused = flatIdx === focusIdx;
                    const isSelected = selected.has(task.id);
                    const isDragging = dragTask.current?.selectedIds
                      ? dragTask.current.selectedIds.has(task.id)
                      : dragTask.current?.taskId === task.id;
                    const isMatch =
                      search &&
                      task.text.toLowerCase().includes(search.toLowerCase());
                    const isCurrent =
                      currentMatch?.type === "task" &&
                      currentMatch.taskId === task.id;
                    return (
                      <div
                        key={task.id}
                        data-task-id={task.id}
                        className={`task-row${isFocused ? " focused" : ""}${isSelected ? " selected" : ""}${isDragging ? " dragging" : ""}${isMatch ? " search-match" : ""}${isCurrent ? " search-current" : ""}`}
                        ref={isFocused ? focusRef : null}
                        draggable="true"
                        onMouseEnter={() => {
                          if (!visualMode) setFocusIdx(flatIdx);
                        }}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            setSelected((s) => {
                              const n = new Set(s);
                              n.has(task.id)
                                ? n.delete(task.id)
                                : n.add(task.id);
                              return n;
                            });
                            if (!selected.size) {
                              setVisualMode(true);
                              setVisualAnchor(flatIdx);
                            }
                          } else if (e.shiftKey && selected.size) {
                            const lo = Math.min(focusIdx, flatIdx),
                              hi = Math.max(focusIdx, flatIdx);
                            const ids = new Set();
                            for (let i = lo; i <= hi; i++)
                              if (allItems[i]?.type === "task")
                                ids.add(allItems[i].taskId);
                            setSelected(ids);
                            setVisualMode(true);
                            setVisualAnchor(focusIdx);
                          } else if (visualMode) exitVisualMode();
                          setFocusIdx(flatIdx);
                        }}
                        onDragStart={(e) => {
                          dragTask.current =
                            isSelected && selected.size > 1
                              ? {
                                  selectedIds: new Set(selected),
                                  phaseId: ph.id,
                                }
                              : { taskId: task.id, phaseId: ph.id };
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          dragTask.current = null;
                          setDragOver(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver({ taskId: task.id });
                        }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => handleDrop(e, task.id, ph.id, false)}
                      >
                        <div className="task-row-main">
                          <div
                            className={`checkbox${task.done ? " checked" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusIdx(flatIdx);
                              toggleTask(ph.id, task.id);
                            }}
                          >
                            {task.done && "✓"}
                          </div>
                          <div className="task-body">
                            <span
                              className={`task-text${task.done ? " done" : ""}`}
                              onClick={() => {
                                setFocusIdx(flatIdx);
                                toggleTask(ph.id, task.id);
                              }}
                            >
                              {task.text}
                            </span>
                            {task.tag && (
                              <span className="tag">{task.tag}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Drop zone at bottom of phase */}
                  <div
                    style={{ height: 4 }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver({ phaseId: ph.id, end: true });
                    }}
                    onDrop={(e) => handleDrop(e, null, ph.id, true)}
                  />
                </div>
                {addingTask === ph.id ? (
                  <div className="add-task-row">
                    <input
                      className="add-task-input"
                      autoFocus
                      placeholder="New task…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          commitNewTask(ph.id, e.target.value);
                          e.target.value = "";
                        }
                        if (e.key === "Escape") setAddingTask(null);
                      }}
                      onBlur={(e) => commitNewTask(ph.id, e.target.value)}
                    />
                  </div>
                ) : (
                  (() => {
                    const addIdx = allItems.findIndex(
                      (it) => it.type === "add" && it.phaseId === ph.id,
                    );
                    const isAddFocused = addIdx === focusIdx;
                    return (
                      <button
                        className={`add-task-link${isAddFocused ? " focused" : ""}`}
                        ref={isAddFocused ? focusRef : null}
                        onClick={() => {
                          setFocusIdx(addIdx);
                          setAddingTask(ph.id);
                        }}
                        onMouseEnter={() => setFocusIdx(addIdx)}
                      >
                        + add task
                      </button>
                    );
                  })()
                )}
              </>
            )}
          </div>
        );
      })}

      {checklist.total_days && (
        <div className="checklist-footer">
          ~{checklist.total_days} days · {checklist.title.toUpperCase()}
        </div>
      )}
      <KeyHintBar hints={hints} mode={mode} />
    </div>
  );
}

// ──── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  const [checklists, setChecklists] = useState(loadData);
  const [view, setView] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [modal, setModal] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [scheme, setScheme] = useState(loadScheme);
  const [uiMode, setUiMode] = useState(loadMode);

  const persist = useCallback((next) => {
    setChecklists(next);
    saveData(next);
  }, []);

  const cycleScheme = useCallback((direct) => {
    setScheme((s) => {
      const next =
        direct instanceof Object && direct.id
          ? direct
          : (() => {
              const i = SCHEMES.findIndex((sc) => sc.id === s.id);
              return SCHEMES[(i + 1) % SCHEMES.length];
            })();
      saveScheme(next);
      applyScheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    applyScheme(scheme);
  }, [scheme]);
  useEffect(() => {
    document.body.classList.toggle("modern", uiMode === "modern");
  }, [uiMode]);

  useEffect(() => {
    const h = (e) => {
      if (
        e.key === "?" &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA"
      )
        setShowHelp((s) => !s);
      if (
        e.key === "T" &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA"
      )
        cycleScheme();
      if (
        e.key === "M" &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA"
      ) {
        setUiMode((m) => {
          const n = m === "classic" ? "modern" : "classic";
          saveMode(n);
          return n;
        });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cycleScheme]);

  const handleSelect = (id) => {
    setActiveId(id);
    setView("detail");
  };
  const handleBack = () => {
    setView("home");
    setActiveId(null);
  };
  const handleSave = (data) => {
    if (modal === "new") persist([...checklists, data]);
    else {
      persist(checklists.map((cl) => (cl.id === data.id ? data : cl)));
      setActiveId(data.id);
    }
    setModal(null);
  };
  const handleChange = (upd) =>
    persist(checklists.map((cl) => (cl.id === upd.id ? upd : cl)));
  const handleDelete = () => {
    persist(checklists.filter((cl) => cl.id !== activeId));
    setView("home");
    setActiveId(null);
  };
  const handleArchive = () => {
    const cl = checklists.find((c) => c.id === activeId);
    if (cl)
      persist(
        checklists.map((c) =>
          c.id === activeId ? { ...c, archived: !c.archived } : c,
        ),
      );
  };
  const handleExport = () => {
    const cl = checklists.find((c) => c.id === activeId);
    if (!cl) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(cl, null, 2)], { type: "application/json" }),
    );
    a.download = `${cl.title.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
  };
  const handleImport = (items) => {
    const ex = new Set(checklists.map((c) => c.id));
    persist([
      ...checklists,
      ...items.map((it) => (ex.has(it.id) ? { ...it, id: uid() } : it)),
    ]);
  };

  const active = checklists.find((cl) => cl.id === activeId);

  return (
    <>
      <style>{styles}</style>
      {uiMode === "modern" && <style>{modernStyles}</style>}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {view === "home" ? (
        <Home
          checklists={checklists}
          onSelect={handleSelect}
          onNew={() => setModal("new")}
          onImport={handleImport}
          scheme={scheme}
          onCycleScheme={cycleScheme}
          uiMode={uiMode}
          onToggleMode={() =>
            setUiMode((m) => {
              const n = m === "classic" ? "modern" : "classic";
              saveMode(n);
              return n;
            })
          }
        />
      ) : active ? (
        <Detail
          checklist={active}
          onChange={handleChange}
          onBack={handleBack}
          onEdit={() => setModal("edit")}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onExport={handleExport}
          modalOpen={!!modal}
          uiMode={uiMode}
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
