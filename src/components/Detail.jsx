import { useState, useRef, useEffect } from "react";
import { uid, getProgress } from "../lib/storage.js";
import { Confetti } from "./Confetti.jsx";
import { KeyHintBar } from "./KeyHintBar.jsx";
import { Checkins } from "./Checkins.jsx";

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

// ──── Detail ──────────────────────────────────────────────────────────────────

export function Detail({
  checklist,
  onChange,
  onBack,
  onEdit,
  onDelete,
  onArchive,
  onExport,
  modalOpen,
  onAddCheckin,
  onDeleteCheckin,
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

  const cycleTaskPriority = (phaseId, taskId) => {
    const newPhases = checklist.phases.map((ph) =>
      ph.id !== phaseId
        ? ph
        : {
            ...ph,
            tasks: ph.tasks.map((t) =>
              t.id !== taskId ? t : { ...t, priority: nextPriority(t.priority) },
            ),
          },
    );
    onChange({ ...checklist, phases: newPhases });
  };

  const setTaskDueDate = (phaseId, taskId, value) => {
    const newPhases = checklist.phases.map((ph) =>
      ph.id !== phaseId
        ? ph
        : {
            ...ph,
            tasks: ph.tasks.map((t) =>
              t.id !== taskId ? t : { ...t, due_date: value || null },
            ),
          },
    );
    onChange({ ...checklist, phases: newPhases });
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
    // Recompute flat index in new layout to follow the moved task
    const nai = newPhases.flatMap((ph) => [
      ...(!collapsedPhases.has(ph.id)
        ? ph.tasks.map((t) => ({ type: "task", phaseId: ph.id, taskId: t.id }))
        : []),
      { type: "add", phaseId: ph.id },
    ]);
    const ni = nai.findIndex(
      (it) => it.type === "task" && it.taskId === taskId,
    );
    if (ni !== -1) setFocusIdx(ni);
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
          e.stopPropagation();
          setShowSearch(false);
          setSearch("");
          return;
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
        if (showSearch) {
          setShowSearch(false);
          setSearch("");
        } else if (confirmDelete) setConfirmDelete(false);
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
                e.stopPropagation();
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
        const addIdx = allItems.findIndex(
          (it) => it.type === "add" && it.phaseId === ph.id,
        );
        const isPhaseFocused = addIdx === focusIdx && isCollapsed;
        return (
          <div className="phase-section" key={ph.id}>
            <div
              data-phase-id={ph.id}
              className={`phase-label${isPhaseFocused ? " phase-label-focused" : ""}${isSearchMatch ? " phase-label-search" : ""}`}
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
              <div
                className={`phase-done-summary${isPhaseFocused ? " phase-done-summary-focused" : ""}`}
              >
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
                          <div
                            className="task-quick-edit"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(() => {
                              const pr =
                                PRIORITIES.find(
                                  (p) => p.id === (task.priority || "none"),
                                ) || PRIORITIES[0];
                              return (
                                <button
                                  type="button"
                                  className="priority-dot-sm"
                                  title={`Priority: ${pr.id} (click to cycle)`}
                                  style={{ color: pr.color, borderColor: pr.color }}
                                  onClick={() => cycleTaskPriority(ph.id, task.id)}
                                >
                                  {pr.label}
                                </button>
                              );
                            })()}
                            <label
                              className={`task-due-badge${task.due_date ? " set" : ""}`}
                              title="Due date"
                            >
                              {task.due_date || "+ due"}
                              <input
                                type="date"
                                value={task.due_date || ""}
                                onChange={(e) => {
                                  setTaskDueDate(ph.id, task.id, e.target.value);
                                  e.target.blur();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape" || e.key === "Enter")
                                    e.target.blur();
                                }}
                                onClick={(e) => {
                                  // Native date inputs grab and keep keyboard
                                  // focus on click (even just to open/close the
                                  // picker, with no change/blur event firing).
                                  // Detail's global j/k/x/V/search handler
                                  // treats any focused INPUT as "typing" and
                                  // silently swallows all subsequent keystrokes,
                                  // so hand focus back once the click settles.
                                  const el = e.target;
                                  setTimeout(() => el.blur(), 0);
                                }}
                              />
                            </label>
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

      {(onAddCheckin || checklist.checkins?.length > 0) && (
        <Checkins
          checkins={checklist.checkins || []}
          onAdd={(note) => onAddCheckin?.(checklist.id, note)}
          onDelete={(checkinId) => onDeleteCheckin?.(checklist.id, checkinId)}
        />
      )}

      <KeyHintBar hints={hints} mode={mode} />
    </div>
  );
}
