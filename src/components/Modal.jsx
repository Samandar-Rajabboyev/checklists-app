import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ACCENT_COLORS } from "../constants.js";
import { uid, ls } from "../lib/storage.js";
import { TEMPLATES, blankTask, blankPhase, buildPhasesFromTemplate } from "../lib/templates.js";
import { parsePastedList } from "../lib/pasteList.js";
import { goalModalStyles } from "../styles/goalModal.js";

// ──── Goal editor (create + edit) ─────────────────────────────────────────────
//
// Built to be typed through like an outliner: title → Enter → tasks, Enter
// for the next task, Enter on an empty last task for a new phase, ↑/↓ to
// move between lines, ⌥↑/↓ to reorder, paste a list to add many at once.
// Rarely-changed fields live in a collapsed "details" row. New-goal input
// is autosaved as a draft; closing with unsaved changes asks first.

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const MOD = IS_MAC ? "⌘" : "Ctrl";
const ALT = IS_MAC ? "⌥" : "Alt";
const DRAFT_KEY = "goal-draft";
const AUTO_LABEL = /^Phase \d+$/;

const EMOJIS = [
  "📋", "🎯", "🚀", "💻", "📚", "📈", "💡", "🛠️",
  "🎨", "✍️", "🏃", "💪", "🧘", "🍎", "💰", "🏠",
  "✈️", "🎓", "🧪", "📱", "🌱", "🔥", "⭐", "🏆",
  "🎵", "📷", "🧠", "❤️", "🗂️", "📝", "⚙️", "🌍",
];

const CATEGORIES = [
  { id: "software", label: "Software" },
  { id: "study", label: "Study" },
  { id: "business", label: "Business" },
  { id: "personal", label: "Personal" },
  { id: "custom", label: "Custom" },
];

const PRIORITIES = [
  { id: "none", label: "!", color: "var(--text-muted)" },
  { id: "low", label: "L", color: "#2AA65A" },
  { id: "medium", label: "M", color: "#D4A22A" },
  { id: "high", label: "H", color: "#D4522A" },
];
const nextPriority = (p) => {
  const i = PRIORITIES.findIndex((x) => x.id === (p || "none"));
  return PRIORITIES[(i + 1) % PRIORITIES.length].id;
};

const fmtDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const daysUntil = (d) => Math.ceil((new Date(`${d}T00:00:00`) - new Date().setHours(0, 0, 0, 0)) / 86400000);

function formFromGoal(goal) {
  if (!goal) {
    return {
      emoji: "📋",
      title: "",
      desc: "",
      color: ACCENT_COLORS[0],
      category: "custom",
      days: "",
      targetDate: "",
      phases: [blankPhase()],
    };
  }
  return {
    emoji: goal.emoji || "📋",
    title: goal.title || "",
    desc: goal.description || "",
    color: goal.color || ACCENT_COLORS[0],
    category: goal.category || "custom",
    days: goal.total_days ? String(goal.total_days) : "",
    targetDate: goal.target_date || "",
    // Keep every server field on phases/tasks (notes, completed_at…) so
    // saving from here doesn't drop what the editor doesn't show.
    phases: (goal.phases || []).map((p) => ({
      ...p,
      label: AUTO_LABEL.test(p.label || "") ? "" : p.label || "",
      title: p.title || "",
      duration: p.duration || "",
      tasks: p.tasks.map((t) => ({
        ...t,
        tag: t.tag || "",
        priority: t.priority || "none",
        due_date: t.due_date || "",
      })),
    })),
  };
}

const hasContent = (f) =>
  !!(f.title.trim() || f.desc.trim() || f.phases.some((p) => p.title.trim() || p.tasks.some((t) => t.text.trim())));

function readDraft() {
  try {
    const d = JSON.parse(ls.get(DRAFT_KEY) || "null");
    return d && Array.isArray(d.phases) && hasContent(d) ? d : null;
  } catch {
    return null;
  }
}

export function Modal({ initial, onSave, onClose }) {
  const isNew = !initial;
  // An edit opened on a summary row (no phases loaded) must not save a
  // phases array, or the sync would read it as "delete every phase".
  const treeLoaded = isNew || Array.isArray(initial.phases);

  const [restoredDraft, setRestoredDraft] = useState(() => isNew && !!readDraft());
  const [form, setForm] = useState(() => (isNew && readDraft()) || formFromGoal(initial));
  const baseline = useRef(JSON.stringify(form));
  const dirty = isNew ? hasContent(form) : JSON.stringify(form) !== baseline.current;

  const [showDetails, setShowDetails] = useState(!!initial?.description);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [armedPhase, setArmedPhase] = useState(null); // phase id awaiting 2nd delete click
  const [template, setTemplate] = useState(null); // { key, snap }
  const [dropAt, setDropAt] = useState(null); // { pid, index }
  const dragging = useRef(null); // { pid, tid }

  const bodyRef = useRef(null);
  const titleRef = useRef(null);
  const emojiRef = useRef(null);
  const pendingFocus = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setPhases = (phases) => setForm((f) => ({ ...f, phases }));
  const { phases } = form;

  // ── Draft autosave (new goals only) ──────────────────────────────────────
  useEffect(() => {
    if (isNew) ls.set(DRAFT_KEY, hasContent(form) ? JSON.stringify(form) : "");
  }, [isNew, form]);

  // ── Focus plumbing: focus an element by nav id after the next render ────
  useLayoutEffect(() => {
    const pf = pendingFocus.current;
    if (!pf) return;
    pendingFocus.current = null;
    const el = bodyRef.current?.querySelector(`[data-nav="${pf.id}"]`);
    if (!el) return;
    el.focus();
    const pos = pf.caret === "start" ? 0 : el.value.length;
    try {
      el.setSelectionRange(pos, pos);
    } catch {}
    el.scrollIntoView({ block: "nearest" });
  });
  const focusSoon = (id, caret = "end") => {
    pendingFocus.current = { id, caret };
  };
  const navEls = () => [...(bodyRef.current?.querySelectorAll("[data-nav]") || [])];
  const focusSibling = (el, delta) => {
    const els = navEls();
    const target = els[els.indexOf(el) + delta];
    if (target) {
      target.focus();
      try {
        target.setSelectionRange(target.value.length, target.value.length);
      } catch {}
      return true;
    }
    return false;
  };

  // ── Close / save ─────────────────────────────────────────────────────────
  const discard = () => {
    if (isNew) ls.set(DRAFT_KEY, "");
    onClose();
  };
  const requestClose = () => {
    if (emojiOpen) return setEmojiOpen(false);
    if (confirmDiscard || !dirty) return discard();
    setConfirmDiscard(true);
  };

  const save = () => {
    const title = form.title.trim();
    if (!title) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }
    const days = parseInt(form.days, 10);
    const goal = {
      id: initial?.id || uid(),
      emoji: form.emoji.trim() || "📋",
      title,
      description: form.desc.trim(),
      color: form.color,
      category: form.category,
      total_days: days > 0 ? days : null,
      target_date: form.targetDate || null,
      created_at: initial?.created_at || new Date().toISOString().slice(0, 10),
    };
    if (treeLoaded) {
      goal.phases = phases
        .map((p) => ({
          ...p,
          title: p.title.trim(),
          duration: p.duration.trim(),
          tasks: p.tasks
            .filter((t) => t.text.trim())
            .map((t) => ({ ...t, text: t.text.trim(), due_date: t.due_date || null })),
        }))
        .filter((p) => p.title || p.label.trim() || p.tasks.length)
        .map((p, i) => ({ ...p, label: p.label.trim() || `Phase ${i}` }));
    }
    if (isNew) ls.set(DRAFT_KEY, "");
    onSave(goal);
  };

  // Dialog-level keys. Every keydown stops here: Home/Detail/plain mode
  // bind single-letter shortcuts on window, and they must not fire while
  // typing (or after clicking a button) in the editor. The dialog is
  // focusable, so focus never falls back to <body> while it's open.
  const onDialogKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      requestClose();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === "Enter" || e.key === "s")) {
      e.preventDefault();
      save();
    }
    e.stopPropagation();
  };

  // Any edit cancels a pending "discard?" prompt.
  useEffect(() => {
    setConfirmDiscard(false);
  }, [form]);

  useEffect(() => {
    if (!emojiOpen) return;
    const h = (e) => !emojiRef.current?.contains(e.target) && setEmojiOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [emojiOpen]);

  useEffect(() => {
    if (!armedPhase) return;
    const t = setTimeout(() => setArmedPhase(null), 2500);
    return () => clearTimeout(t);
  }, [armedPhase]);

  // ── Templates ────────────────────────────────────────────────────────────
  const phasesEmpty = phases.every((p) => !p.title.trim() && p.tasks.every((t) => !t.text.trim()));
  const showTemplates = isNew && (phasesEmpty || (template && JSON.stringify(phases) === template.snap));
  const pickTemplate = (key) => {
    if (template?.key === key) {
      setTemplate(null);
      setPhases([blankPhase()]);
      return;
    }
    const built = buildPhasesFromTemplate(key);
    setForm((f) => ({
      ...f,
      phases: built,
      category: key,
      emoji: f.emoji === "📋" || Object.values(TEMPLATES).some((t) => t.emoji === f.emoji) ? TEMPLATES[key].emoji : f.emoji,
    }));
    setTemplate({ key, snap: JSON.stringify(built) });
  };

  const startFresh = () => {
    ls.set(DRAFT_KEY, "");
    setForm(formFromGoal(null));
    setRestoredDraft(false);
    setTemplate(null);
    titleRef.current?.focus();
  };

  // ── Phase operations ─────────────────────────────────────────────────────
  const updatePhase = (pid, patch) => setPhases(phases.map((p) => (p.id === pid ? { ...p, ...patch } : p)));
  const insertPhaseAfter = (pid) => {
    const np = blankPhase();
    const i = phases.findIndex((p) => p.id === pid);
    const next = [...phases];
    next.splice(i + 1, 0, np);
    setPhases(next);
    focusSoon(`ph:${np.id}`);
  };
  const addPhaseAtEnd = () => {
    const np = blankPhase();
    setPhases([...phases, np]);
    focusSoon(`ph:${np.id}`);
  };
  const movePhase = (pid, dir) => {
    const i = phases.findIndex((p) => p.id === pid);
    const to = dir === "up" ? i - 1 : i + 1;
    if (to < 0 || to >= phases.length) return;
    const next = [...phases];
    [next[i], next[to]] = [next[to], next[i]];
    setPhases(next);
    focusSoon(`ph:${pid}`);
  };
  const removePhase = (pid) => {
    const ph = phases.find((p) => p.id === pid);
    if (ph.tasks.some((t) => t.text.trim()) && armedPhase !== pid) {
      setArmedPhase(pid);
      return;
    }
    setArmedPhase(null);
    const rest = phases.filter((p) => p.id !== pid);
    setPhases(rest.length ? rest : [blankPhase()]);
  };

  // ── Task operations ──────────────────────────────────────────────────────
  const mapTasks = (pid, fn) => phases.map((p) => (p.id === pid ? { ...p, tasks: fn(p.tasks) } : p));
  const updateTask = (pid, tid, patch) =>
    setPhases(mapTasks(pid, (ts) => ts.map((t) => (t.id === tid ? { ...t, ...patch } : t))));
  const insertTask = (pid, index, task = blankTask(), caret = "end") => {
    setPhases(mapTasks(pid, (ts) => [...ts.slice(0, index), task, ...ts.slice(index)]));
    focusSoon(`t:${task.id}`, caret);
  };
  const removeTask = (pid, tid) => setPhases(mapTasks(pid, (ts) => ts.filter((t) => t.id !== tid)));

  const moveTask = (pid, tid, dir) => {
    const pi = phases.findIndex((p) => p.id === pid);
    const ti = phases[pi].tasks.findIndex((t) => t.id === tid);
    const task = phases[pi].tasks[ti];
    const next = phases.map((p) => ({ ...p, tasks: [...p.tasks] }));
    const nti = dir === "up" ? ti - 1 : ti + 1;
    next[pi].tasks.splice(ti, 1);
    if (nti >= 0 && nti <= next[pi].tasks.length) {
      next[pi].tasks.splice(nti, 0, task);
    } else {
      // Past the edge of the phase: hop into the neighbouring one.
      const npi = dir === "up" ? pi - 1 : pi + 1;
      if (npi < 0 || npi >= next.length) return;
      if (dir === "up") next[npi].tasks.push(task);
      else next[npi].tasks.unshift(task);
    }
    setPhases(next);
    focusSoon(`t:${tid}`);
  };

  const moveTaskTo = (from, to) => {
    const src = phases.find((p) => p.id === from.pid);
    const ti = src.tasks.findIndex((t) => t.id === from.tid);
    const task = src.tasks[ti];
    let index = to.index;
    if (from.pid === to.pid && ti < index) index--;
    const without = phases.map((p) => (p.id === from.pid ? { ...p, tasks: p.tasks.filter((t) => t.id !== from.tid) } : p));
    setPhases(
      without.map((p) =>
        p.id === to.pid ? { ...p, tasks: [...p.tasks.slice(0, index), task, ...p.tasks.slice(index)] } : p,
      ),
    );
  };

  // Paste a multi-line list → many tasks (and phases for "# headings").
  // `tid` null = pasted into the phase's "Add a task…" line.
  const pasteList = (e, pid, tid) => {
    const text = e.clipboardData.getData("text/plain");
    if (!text.trim().includes("\n")) return;
    const items = parsePastedList(text);
    if (!items.length) return;
    e.preventDefault();

    const next = phases.map((p) => ({ ...p, tasks: [...p.tasks] }));
    const pi = next.findIndex((p) => p.id === pid);
    let target = next[pi];
    let at = target.tasks.length;
    if (tid) {
      const ti = target.tasks.findIndex((t) => t.id === tid);
      if (target.tasks[ti].text.trim()) at = ti + 1;
      else {
        target.tasks.splice(ti, 1);
        at = ti;
      }
    }
    const newPhases = [];
    let lastId = null;
    for (const it of items) {
      if (it.type === "phase") {
        target = blankPhase(it.title);
        newPhases.push(target);
        at = 0;
        lastId = null;
        continue;
      }
      const t = blankTask(it.text, it.done);
      target.tasks.splice(at++, 0, t);
      lastId = t.id;
    }
    next.splice(pi + 1, 0, ...newPhases);
    setPhases(next);
    focusSoon(lastId ? `t:${lastId}` : `add:${target.id}`);
  };

  // ── Keyboard handlers ────────────────────────────────────────────────────
  const onArrows = (e, onAltMove) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return false;
    e.preventDefault();
    if (e.altKey) onAltMove?.(e.key === "ArrowUp" ? "up" : "down");
    else focusSibling(e.currentTarget, e.key === "ArrowUp" ? -1 : 1);
    return true;
  };

  const onTitleKey = (e) => {
    if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      focusSibling(e.currentTarget, 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusSibling(e.currentTarget, 1);
    }
  };

  const onPhaseTitleKey = (e, ph) => {
    if (onArrows(e, (dir) => movePhase(ph.id, dir))) return;
    if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      if (e.shiftKey) insertPhaseAfter(ph.id);
      else focusSibling(e.currentTarget, 1); // first task, or the "Add a task" line
    } else if (e.key === "Backspace" && !ph.title && !ph.tasks.length && phases.length > 1) {
      e.preventDefault();
      focusSibling(e.currentTarget, -1);
      removePhase(ph.id);
    }
  };

  const onTaskKey = (e, ph, t, ti) => {
    if (onArrows(e, (dir) => moveTask(ph.id, t.id, dir))) return;
    if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const isLast = ti === ph.tasks.length - 1;
      if (e.shiftKey || (!t.text.trim() && isLast)) {
        // Shift+Enter, or Enter on an empty last line: start a new phase.
        if (!t.text.trim()) {
          const np = blankPhase();
          const next = phases.map((p) => (p.id === ph.id ? { ...p, tasks: p.tasks.filter((x) => x.id !== t.id) } : p));
          next.splice(next.findIndex((p) => p.id === ph.id) + 1, 0, np);
          setPhases(next);
          focusSoon(`ph:${np.id}`);
        } else insertPhaseAfter(ph.id);
        return;
      }
      // Split at the caret, outliner-style.
      const pos = e.currentTarget.selectionStart ?? t.text.length;
      const before = t.text.slice(0, pos);
      const after = t.text.slice(pos);
      const nt = blankTask(after);
      setPhases(
        mapTasks(ph.id, (ts) => {
          const out = ts.map((x) => (x.id === t.id ? { ...x, text: before } : x));
          out.splice(ti + 1, 0, nt);
          return out;
        }),
      );
      focusSoon(`t:${nt.id}`, "start");
    } else if (e.key === "Backspace" && t.text === "") {
      e.preventDefault();
      focusSibling(e.currentTarget, -1);
      removeTask(ph.id, t.id);
    }
  };

  const onAddLineKey = (e, ph) => {
    if (onArrows(e)) return;
    if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      // Empty "Add a task…" + Enter = done with this phase, start the next.
      insertPhaseAfter(ph.id);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      focusSibling(e.currentTarget, -1);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const taskCount = phases.reduce((n, p) => n + p.tasks.filter((t) => t.text.trim()).length, 0);
  const phaseCount = phases.filter((p) => p.title.trim() || p.tasks.some((t) => t.text.trim())).length;
  const categoryLabel = CATEGORIES.find((c) => c.id === form.category)?.label;

  return (
    <div
      className="gm-overlay"
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        e.preventDefault(); // keep focus inside the dialog
        requestClose();
      }}
    >
      <style>{goalModalStyles}</style>
      <div className="gm" role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={onDialogKey} aria-label={isNew ? "New goal" : "Edit goal"}>
        <div className="gm-body" ref={bodyRef}>
          {restoredDraft && (
            <div className="gm-banner">
              <span>Restored your unsaved draft.</span>
              <button className="gm-link" onClick={startFresh}>
                Start fresh
              </button>
            </div>
          )}

          {/* Emoji + title */}
          <div className="gm-head-row">
            <div className="gm-emoji-wrap" ref={emojiRef}>
              <button
                type="button"
                className="gm-emoji-btn"
                title="Change icon"
                aria-label="Change icon"
                tabIndex={-1}
                onClick={() => setEmojiOpen((o) => !o)}
              >
                {form.emoji || "📋"}
              </button>
              {emojiOpen && (
                <div className="gm-emoji-pop">
                  {EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className={em === form.emoji ? "on" : ""}
                      onClick={() => {
                        set("emoji", em);
                        setEmojiOpen(false);
                        titleRef.current?.focus();
                      }}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    className="gm-input"
                    placeholder="Or type / paste any emoji"
                    maxLength={8}
                    onChange={(e) => e.target.value.trim() && set("emoji", e.target.value.trim())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setEmojiOpen(false);
                        titleRef.current?.focus();
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <input
              ref={titleRef}
              autoFocus
              data-nav="title"
              className={`gm-title${titleError ? " gm-shake" : ""}`}
              value={form.title}
              placeholder={isNew ? "What's the goal?" : "Goal title"}
              onChange={(e) => {
                set("title", e.target.value);
                setTitleError(false);
              }}
              onAnimationEnd={(e) => e.currentTarget.classList.remove("gm-shake")}
              onKeyDown={onTitleKey}
            />
            <button className="gm-icon-btn gm-close" tabIndex={-1} aria-label="Close" onClick={requestClose}>
              ×
            </button>
          </div>
          {titleError && <div className="gm-error">Give your goal a name first.</div>}

          {/* Templates */}
          {showTemplates && (
            <div className="gm-chips">
              <span className="gm-chip-label">Start from</span>
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  type="button"
                  tabIndex={-1}
                  className={`gm-chip${template?.key === key ? " on" : ""}`}
                  onClick={() => pickTemplate(key)}
                >
                  <span>{tpl.emoji}</span>
                  {tpl.label}
                </button>
              ))}
            </div>
          )}

          {/* Details (collapsed by default) */}
          <button type="button" tabIndex={-1} className="gm-details-toggle" onClick={() => setShowDetails((s) => !s)}>
            <span className="gm-caret">{showDetails ? "▾" : "▸"}</span>
            {showDetails ? (
              <span>Details</span>
            ) : (
              <>
                <span className="gm-pill">{categoryLabel}</span>
                <span className="gm-pill">
                  <span className="gm-dot" style={{ background: form.color }} />
                  color
                </span>
                {form.targetDate ? (
                  <span className="gm-pill">due {fmtDate(form.targetDate)}</span>
                ) : form.days ? (
                  <span className="gm-pill">~{form.days} days</span>
                ) : (
                  <span className="gm-pill gm-pill-muted">+ deadline</span>
                )}
                <span className={`gm-pill${form.desc.trim() ? "" : " gm-pill-muted"}`}>
                  {form.desc.trim() ? "description" : "+ description"}
                </span>
              </>
            )}
          </button>
          {showDetails && (
            <div className="gm-details">
              <div className="gm-field">
                <label htmlFor="gm-desc">Description</label>
                <textarea
                  id="gm-desc"
                  className="gm-input"
                  value={form.desc}
                  placeholder="What's this for? What does done look like?"
                  rows={2}
                  onChange={(e) => {
                    set("desc", e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
              </div>
              <div className="gm-field">
                <label>Category</label>
                <div className="gm-chips gm-chips-tight">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`gm-chip${form.category === c.id ? " on" : ""}`}
                      onClick={() => set("category", c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="gm-row2">
                <div className="gm-field">
                  <label htmlFor="gm-target">Target date</label>
                  <input
                    id="gm-target"
                    type="date"
                    className="gm-input"
                    value={form.targetDate}
                    onChange={(e) => set("targetDate", e.target.value)}
                  />
                  {form.targetDate && (
                    <div className="gm-hint">
                      {daysUntil(form.targetDate) >= 0
                        ? `${daysUntil(form.targetDate)} days from today`
                        : `${-daysUntil(form.targetDate)} days ago`}
                    </div>
                  )}
                </div>
                <div className="gm-field">
                  <label htmlFor="gm-days">Estimated effort</label>
                  <div className="gm-suffix">
                    <input
                      id="gm-days"
                      className="gm-input"
                      inputMode="numeric"
                      value={form.days}
                      placeholder="—"
                      onChange={(e) => set("days", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                    <span>days</span>
                  </div>
                </div>
              </div>
              <div className="gm-field">
                <label>Accent color</label>
                <div className="gm-swatches">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      className={`gm-swatch${form.color === c ? " on" : ""}`}
                      style={{ background: c }}
                      onClick={() => set("color", c)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Phases & tasks */}
          <div className="gm-section-label">
            <span>Phases & tasks</span>
          </div>
          {!treeLoaded ? (
            <div className="gm-hint">Loading phases…</div>
          ) : (
            phases.map((ph, pi) => (
              <div className="gm-phase" key={ph.id}>
                <div className="gm-phase-head">
                  <input
                    className="gm-phase-label"
                    value={ph.label}
                    placeholder={`Phase ${pi}`}
                    title="Phase label (leave blank to auto-number)"
                    tabIndex={-1}
                    onChange={(e) => updatePhase(ph.id, { label: e.target.value })}
                  />
                  <input
                    className="gm-phase-title"
                    data-nav={`ph:${ph.id}`}
                    value={ph.title}
                    placeholder={pi === 0 ? "First phase, e.g. Planning" : "Phase name"}
                    onChange={(e) => updatePhase(ph.id, { title: e.target.value })}
                    onKeyDown={(e) => onPhaseTitleKey(e, ph)}
                  />
                  <input
                    className="gm-phase-dur"
                    value={ph.duration}
                    placeholder="duration"
                    title="How long this phase should take, e.g. 2 weeks"
                    tabIndex={-1}
                    onChange={(e) => updatePhase(ph.id, { duration: e.target.value })}
                  />
                  <div className="gm-phase-actions">
                    <button className="gm-icon-btn" tabIndex={-1} title={`Move up (${ALT}↑)`} disabled={pi === 0} onClick={() => movePhase(ph.id, "up")}>
                      ↑
                    </button>
                    <button
                      className="gm-icon-btn"
                      tabIndex={-1}
                      title={`Move down (${ALT}↓)`}
                      disabled={pi === phases.length - 1}
                      onClick={() => movePhase(ph.id, "down")}
                    >
                      ↓
                    </button>
                    <button
                      className={`gm-icon-btn${armedPhase === ph.id ? " gm-armed" : ""}`}
                      tabIndex={-1}
                      title="Delete phase"
                      onClick={() => removePhase(ph.id)}
                    >
                      {armedPhase === ph.id ? "Delete phase?" : "×"}
                    </button>
                  </div>
                </div>

                <div className="gm-tasks">
                  {ph.tasks.map((t, ti) => {
                    const pr = PRIORITIES.find((p) => p.id === t.priority) || PRIORITIES[0];
                    return (
                      <div
                        key={t.id}
                        className={`gm-task${t.done ? " done" : ""}${dropAt?.pid === ph.id && dropAt.index === ti ? " drop-before" : ""}`}
                        onDragOver={(e) => {
                          if (!dragging.current) return;
                          e.preventDefault();
                          const r = e.currentTarget.getBoundingClientRect();
                          const index = e.clientY > r.top + r.height / 2 ? ti + 1 : ti;
                          if (dropAt?.pid !== ph.id || dropAt.index !== index) setDropAt({ pid: ph.id, index });
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragging.current && dropAt) moveTaskTo(dragging.current, dropAt);
                          dragging.current = null;
                          setDropAt(null);
                        }}
                      >
                        <span
                          className="gm-handle"
                          draggable
                          title="Drag to reorder"
                          onDragStart={(e) => {
                            dragging.current = { pid: ph.id, tid: t.id };
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", t.text);
                            e.dataTransfer.setDragImage(e.currentTarget.parentElement, 12, 12);
                          }}
                          onDragEnd={() => {
                            dragging.current = null;
                            setDropAt(null);
                          }}
                        >
                          ⠿
                        </span>
                        <button
                          type="button"
                          className={`gm-check${t.done ? " on" : ""}`}
                          tabIndex={-1}
                          aria-label={t.done ? "Mark not done" : "Mark done"}
                          onClick={() => updateTask(ph.id, t.id, { done: !t.done })}
                        >
                          {t.done ? "✓" : ""}
                        </button>
                        <input
                          className="gm-task-input"
                          data-nav={`t:${t.id}`}
                          value={t.text}
                          placeholder="Task"
                          onChange={(e) => updateTask(ph.id, t.id, { text: e.target.value })}
                          onKeyDown={(e) => onTaskKey(e, ph, t, ti)}
                          onPaste={(e) => pasteList(e, ph.id, t.id)}
                        />
                        <div className="gm-meta">
                          <button
                            type="button"
                            className={`gm-prio${t.priority === "none" ? " none" : ""}`}
                            style={{ color: pr.color, borderColor: pr.color }}
                            tabIndex={-1}
                            title={`Priority: ${pr.id} — click to change`}
                            onClick={() => updateTask(ph.id, t.id, { priority: nextPriority(t.priority) })}
                          >
                            {pr.label}
                          </button>
                          <label className={`gm-due${t.due_date ? "" : " empty"}`} title="Due date">
                            {t.due_date ? fmtDate(t.due_date) : "📅"}
                            <input
                              type="date"
                              tabIndex={-1}
                              value={t.due_date || ""}
                              onClick={(e) => {
                                try {
                                  e.currentTarget.showPicker?.();
                                } catch {}
                              }}
                              onChange={(e) => updateTask(ph.id, t.id, { due_date: e.target.value })}
                            />
                          </label>
                          {t.due_date && (
                            <button
                              type="button"
                              className="gm-icon-btn gm-mini"
                              tabIndex={-1}
                              title="Clear due date"
                              onClick={() => updateTask(ph.id, t.id, { due_date: "" })}
                            >
                              ×
                            </button>
                          )}
                          <button
                            type="button"
                            className="gm-icon-btn gm-del"
                            tabIndex={-1}
                            title="Remove task"
                            onClick={() => removeTask(ph.id, t.id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* "Add a task…" line: typing here creates a real task. */}
                  <div
                    className={`gm-task gm-add${dropAt?.pid === ph.id && dropAt.index === ph.tasks.length ? " drop-before" : ""}`}
                    onDragOver={(e) => {
                      if (!dragging.current) return;
                      e.preventDefault();
                      if (dropAt?.pid !== ph.id || dropAt.index !== ph.tasks.length) {
                        setDropAt({ pid: ph.id, index: ph.tasks.length });
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragging.current && dropAt) moveTaskTo(dragging.current, dropAt);
                      dragging.current = null;
                      setDropAt(null);
                    }}
                  >
                    <span className="gm-plus">+</span>
                    <input
                      className="gm-task-input"
                      data-nav={`add:${ph.id}`}
                      value=""
                      placeholder={ph.tasks.length ? "Add a task" : "Add a task — or paste a list"}
                      onChange={(e) => insertTask(ph.id, ph.tasks.length, blankTask(e.target.value))}
                      onKeyDown={(e) => onAddLineKey(e, ph)}
                      onPaste={(e) => pasteList(e, ph.id, null)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
          {treeLoaded && (
            <button type="button" className="gm-add-phase" onClick={addPhaseAtEnd}>
              + Add phase
            </button>
          )}

          <div className="gm-hints">
            <span><kbd>↵</kbd> next task</span>
            <span><kbd>↵</kbd> on empty line → new phase</span>
            <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
            <span><kbd>{ALT}↑</kbd><kbd>{ALT}↓</kbd> reorder</span>
            <span>paste a list to add many</span>
          </div>
        </div>

        {/* Footer — always visible */}
        <div className="gm-foot">
          {confirmDiscard ? (
            <>
              <span className="gm-foot-msg">Discard unsaved changes?</span>
              <button className="gm-btn" onClick={() => setConfirmDiscard(false)}>
                Keep editing
              </button>
              <button className="gm-btn gm-btn-danger" onClick={discard}>
                Discard <kbd>Esc</kbd>
              </button>
            </>
          ) : (
            <>
              <span className="gm-foot-msg">
                {phaseCount} {phaseCount === 1 ? "phase" : "phases"} · {taskCount} {taskCount === 1 ? "task" : "tasks"}
                {isNew && dirty && <span className="gm-saved"> · draft saved</span>}
              </span>
              <button className="gm-btn" onClick={requestClose}>
                Cancel
              </button>
              <button className="gm-btn gm-btn-primary" onClick={save}>
                {isNew ? "Create goal" : "Save"} <kbd>{MOD}↵</kbd>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
