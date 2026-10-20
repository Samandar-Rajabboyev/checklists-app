import { useState, useRef, useEffect } from "react";
import { uid, getProgress } from "../lib/storage.js";
import { KeyHintBar } from "./KeyHintBar.jsx";

// ──── Plain Content ──────────────────────────────────────────────────────────

export function PlainContent({
  cl,
  handleChange,
  handleDelete,
  handleArchive,
  onExport,
  setModal,
  focusArea,
  setFocusArea,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmTaskDel, setConfirmTaskDel] = useState(false);
  const [ddPending, setDdPending] = useState(false);
  const ddTimer = useRef(null);
  const [addingTask, setAddingTask] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchIdx, setSearchIdx] = useState(0);
  const [visualMode, setVisualMode] = useState(false);
  const [visualAnchor, setVisualAnchor] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [collapsedPhases, setCollapsedPhases] = useState(() => {
    const s = new Set();
    cl.phases.forEach((ph) => {
      if (ph.tasks.length > 0 && ph.tasks.every((t) => t.done)) s.add(ph.id);
    });
    return s;
  });
  const searchRef = useRef(null);
  const focusRef = useRef(null);

  const toggleCollapse = (id) =>
    setCollapsedPhases((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // Flat items for keyboard nav
  const allItems = cl.phases.flatMap((ph) => [
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
    cl.phases.forEach((ph) => {
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

  useEffect(() => {
    if (!currentMatch) return;
    setTimeout(() => {
      const el =
        currentMatch.type === "phase"
          ? document.querySelector(
              `[data-plain-phase="${currentMatch.phaseId}"]`,
            )
          : document.querySelector(
              `[data-plain-task="${currentMatch.taskId}"]`,
            );
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 30);
  }, [searchIdx, search]);

  useEffect(() => {
    if (focusRef.current)
      focusRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
  }, [focusIdx]);

  const { done, total } = getProgress(cl);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggleTask = (phaseId, taskId) => {
    const itemIdx = focusIdx;
    const newPhases = cl.phases.map((ph) =>
      ph.id !== phaseId
        ? ph
        : {
            ...ph,
            tasks: ph.tasks.map((t) =>
              t.id !== taskId ? t : { ...t, done: !t.done },
            ),
          },
    );
    handleChange({ ...cl, phases: newPhases });
    const ph = newPhases.find((p) => p.id === phaseId);
    if (ph && ph.tasks.every((t) => t.done))
      setTimeout(() => {
        setCollapsedPhases((s) => {
          const n = new Set(s);
          n.add(phaseId);
          return n;
        });
        setFocusIdx(itemIdx);
      }, 400);
    else
      setCollapsedPhases((s) => {
        const n = new Set(s);
        n.delete(phaseId);
        return n;
      });
    setFocusIdx(itemIdx);
  };

  const deleteTaskFn = () => {
    if (visualMode && selected.size > 0) {
      const ids = selected;
      handleChange({
        ...cl,
        phases: cl.phases.map((ph) => ({
          ...ph,
          tasks: ph.tasks.filter((t) => !ids.has(t.id)),
        })),
      });
      setVisualMode(false);
      setVisualAnchor(null);
      setSelected(new Set());
    } else {
      const item = allItems[focusIdx];
      if (!item || item.type !== "task") return;
      handleChange({
        ...cl,
        phases: cl.phases.map((ph) =>
          ph.id !== item.phaseId
            ? ph
            : { ...ph, tasks: ph.tasks.filter((t) => t.id !== item.taskId) },
        ),
      });
      setFocusIdx((i) => Math.max(0, i - 1));
    }
    setConfirmTaskDel(false);
    setDdPending(false);
  };

  const moveTask = (taskId, fromPhaseId, dir) => {
    const phases = cl.phases;
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
    handleChange({ ...cl, phases: newPhases });
    const nai = newPhases.flatMap((ph) => [
      ...(!collapsedPhases.has(ph.id)
        ? ph.tasks.map((t) => ({
            type: "task",
            phaseId: ph.id,
            taskId: t.id,
          }))
        : []),
      { type: "add", phaseId: ph.id },
    ]);
    const ni = nai.findIndex(
      (it) => it.type === "task" && it.taskId === taskId,
    );
    if (ni !== -1) setFocusIdx(ni);
  };

  // Keyboard
  useEffect(() => {
    if (focusArea !== "content") return;
    const h = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        if (showSearch && e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setShowSearch(false);
          setSearch("");
        }
        return;
      }
      if (showSearch) {
        if (e.key === "Escape") {
          setShowSearch(false);
          setSearch("");
          return;
        }
        if (e.key === "n" && !e.shiftKey) {
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
      if (visualMode) {
        if (e.key === "j" || e.key === "ArrowDown") {
          e.preventDefault();
          const n = Math.min(focusIdx + 1, allItems.length - 1);
          setFocusIdx(n);
        } else if (e.key === "k" || e.key === "ArrowUp") {
          e.preventDefault();
          const n = Math.max(focusIdx - 1, 0);
          setFocusIdx(n);
        } else if (e.key === "x" || e.key === "Enter") {
          e.preventDefault(); /* toggle all selected */
        } else if (e.key === "J") {
          e.preventDefault(); /* moveSelected down */
        } else if (e.key === "K") {
          e.preventDefault(); /* moveSelected up */
        } else if (e.key === "d") {
          e.preventDefault();
          if (confirmTaskDel) deleteTaskFn();
          else if (ddPending) {
            clearTimeout(ddTimer.current);
            setDdPending(false);
            setConfirmTaskDel(true);
          } else {
            setDdPending(true);
            ddTimer.current = setTimeout(() => setDdPending(false), 400);
          }
        } else if (e.key === "y" && confirmTaskDel) {
          e.preventDefault();
          deleteTaskFn();
        } else if (e.key === "n" && confirmTaskDel) {
          e.preventDefault();
          setConfirmTaskDel(false);
          setDdPending(false);
        } else if (e.key === "V" || e.key === "Escape") {
          e.preventDefault();
          setVisualMode(false);
          setVisualAnchor(null);
          setSelected(new Set());
        }
        return;
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "h" || e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusArea("sidebar");
      } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        window.scrollBy({
          top: window.innerHeight * 0.5,
          behavior: "smooth",
        });
      } else if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        window.scrollBy({
          top: -window.innerHeight * 0.5,
          behavior: "smooth",
        });
      } else if (
        (e.key === "Enter" || e.key === " " || e.key === "x") &&
        item
      ) {
        e.preventDefault();
        if (item.type === "task") toggleTask(item.phaseId, item.taskId);
        if (item.type === "add") setAddingTask(item.phaseId);
      } else if (e.key === "V" && item?.type === "task") {
        e.preventDefault();
        setVisualMode(true);
        setVisualAnchor(focusIdx);
        setSelected(new Set([item.taskId]));
      } else if (e.key === "z") {
        e.preventDefault();
        if (item) toggleCollapse(item.phaseId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (showSearch) {
          setShowSearch(false);
          setSearch("");
        } else if (confirmDelete) setConfirmDelete(false);
        else if (confirmTaskDel) {
          setConfirmTaskDel(false);
          setDdPending(false);
        } else setFocusArea("sidebar");
      } else if (e.key === "e") {
        e.preventDefault();
        setModal("edit");
      } else if (e.key === "a") {
        e.preventDefault();
        handleArchive();
      } else if (e.key === "E") {
        e.preventDefault();
        onExport(cl.id);
      } else if (e.key === "d" && !confirmDelete) {
        e.preventDefault();
        if (confirmTaskDel) deleteTaskFn();
        else if (ddPending) {
          clearTimeout(ddTimer.current);
          setDdPending(false);
          setConfirmTaskDel(true);
        } else {
          setDdPending(true);
          ddTimer.current = setTimeout(() => {
            setDdPending(false);
            setConfirmDelete(true);
          }, 400);
        }
      } else if (e.key === "y" && confirmDelete) {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "n" && confirmDelete) {
        e.preventDefault();
        setConfirmDelete(false);
      } else if (e.key === "y" && confirmTaskDel) {
        e.preventDefault();
        deleteTaskFn();
      } else if (e.key === "n" && confirmTaskDel) {
        e.preventDefault();
        setConfirmTaskDel(false);
        setDdPending(false);
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
      } else if (e.key === "/") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 30);
      } else if (e.key === "g") setFocusIdx(0);
      else if (e.key === "G") setFocusIdx(allItems.length - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [
    focusArea,
    focusIdx,
    allItems,
    showSearch,
    searchMatches,
    searchIdx,
    visualMode,
    confirmDelete,
    confirmTaskDel,
    ddPending,
    cl,
    collapsedPhases,
  ]);

  const mode = visualMode ? `VISUAL (${selected.size})` : "NORMAL";

  return (
    <div className="plain-main">
      {showSearch && (
        <div className="detail-search">
          <span className="detail-search-icon">⌕</span>
          <input
            ref={searchRef}
            value={search}
            placeholder="search…"
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

      <div className="plain-header">
        <div className="plain-header-title">
          {cl.emoji} {cl.title}
        </div>
        <div className="plain-header-meta">
          {cl.description && <span>{cl.description}</span>}
          {cl.total_days && <span>~{cl.total_days} days</span>}
          {cl.archived && <span>[archived]</span>}
        </div>
        <div className="plain-header-actions">
          {confirmDelete ? (
            <span className="plain-confirm">
              delete?{" "}
              <button className="plain-confirm-btn yes" onClick={handleDelete}>
                yes
              </button>
              <button
                className="plain-confirm-btn"
                onClick={() => setConfirmDelete(false)}
              >
                no
              </button>
            </span>
          ) : (
            <>
              <button
                className="plain-header-action"
                onClick={() => setModal("edit")}
              >
                [e] edit
              </button>
              <button className="plain-header-action" onClick={handleArchive}>
                [a] {cl.archived ? "unarchive" : "archive"}
              </button>
              <button
                className="plain-header-action"
                onClick={() => onExport(cl.id)}
              >
                [E] export
              </button>
              <button
                className="plain-header-action danger"
                onClick={() => setConfirmDelete(true)}
              >
                [d] delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="plain-progress">
        <span>
          {done}/{total} tasks
        </span>
        <div className="plain-progress-bar">
          <div className="plain-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span>{pct}%</span>
      </div>

      {cl.phases.map((ph) => {
        const isCollapsed = collapsedPhases.has(ph.id);
        const phDone = ph.tasks.filter((t) => t.done).length;
        const addIdx = allItems.findIndex(
          (it) => it.type === "add" && it.phaseId === ph.id,
        );
        const isAddFocused = addIdx === focusIdx;
        const isPhFocused = isCollapsed && isAddFocused;

        return (
          <div className="plain-phase" key={ph.id}>
            <div
              className="plain-phase-header"
              data-plain-phase={ph.id}
              onClick={() => toggleCollapse(ph.id)}
            >
              <span className="plain-phase-arrow">
                {isCollapsed ? "▶" : "▼"}
              </span>
              <span
                className={`plain-phase-name${isPhFocused ? " focused" : ""}`}
              >
                {ph.label}
                {ph.title ? ` - ${ph.title}` : ""}
              </span>
              {isCollapsed && (
                <span className="plain-phase-summary">
                  {phDone === ph.tasks.length
                    ? `✓ ${ph.tasks.length} tasks`
                    : `${phDone}/${ph.tasks.length} tasks`}
                </span>
              )}
            </div>

            {!isCollapsed && (
              <div className="plain-tasks">
                {ph.tasks.map((task, ti) => {
                  const flatIdx = allItems.findIndex(
                    (it) => it.type === "task" && it.taskId === task.id,
                  );
                  const isFocused =
                    flatIdx === focusIdx && focusArea === "content";
                  const isSelected = selected.has(task.id);
                  const isMatch =
                    search &&
                    task.text.toLowerCase().includes(search.toLowerCase());
                  const isCurrent =
                    currentMatch?.type === "task" &&
                    currentMatch.taskId === task.id;
                  return (
                    <div
                      key={task.id}
                      data-plain-task={task.id}
                      className={`plain-task${isFocused ? " focused" : ""}${isSelected ? " selected" : ""}`}
                      ref={isFocused ? focusRef : null}
                      style={isCurrent ? { color: "var(--accent)" } : {}}
                      onClick={() => {
                        setFocusArea("content");
                        setFocusIdx(flatIdx);
                        toggleTask(ph.id, task.id);
                      }}
                      onMouseEnter={() => {
                        if (focusArea === "content") setFocusIdx(flatIdx);
                      }}
                    >
                      <span className="plain-task-num">{ti + 1}</span>
                      <span
                        className={`plain-task-check${task.done ? " done" : ""}`}
                      >
                        {task.done ? "[x]" : "[ ]"}
                      </span>
                      <span
                        className={`plain-task-text${task.done ? " done" : ""}`}
                        style={
                          isMatch && !isCurrent
                            ? { textDecoration: "underline" }
                            : {}
                        }
                      >
                        {task.text}
                      </span>
                      {task.tag && (
                        <span style={{ opacity: 0.4, fontSize: "0.66rem" }}>
                          [{task.tag}]
                        </span>
                      )}
                    </div>
                  );
                })}
                {addingTask === ph.id ? (
                  <div className="plain-add-task">
                    <input
                      autoFocus
                      placeholder="new task…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          handleChange({
                            ...cl,
                            phases: cl.phases.map((p) =>
                              p.id !== ph.id
                                ? p
                                : {
                                    ...p,
                                    tasks: [
                                      ...p.tasks,
                                      {
                                        id: uid(),
                                        text: e.target.value.trim(),
                                        done: false,
                                      },
                                    ],
                                  },
                            ),
                          });
                          e.target.value = "";
                          setAddingTask(null);
                        }
                        if (e.key === "Escape") setAddingTask(null);
                      }}
                      onBlur={() => setAddingTask(null)}
                    />
                  </div>
                ) : (
                  <button
                    className={`plain-add-link${isAddFocused && focusArea === "content" ? " focused" : ""}`}
                    ref={
                      isAddFocused && focusArea === "content" ? focusRef : null
                    }
                    onClick={() => {
                      setFocusArea("content");
                      setFocusIdx(addIdx);
                      setAddingTask(ph.id);
                    }}
                  >
                    + add task
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <KeyHintBar
        mode={mode}
        hints={
          confirmTaskDel
            ? [
                { key: "dd/y", label: "delete" },
                { key: "n", label: "cancel" },
              ]
            : confirmDelete
              ? [
                  { key: "y", label: "confirm" },
                  { key: "n", label: "cancel" },
                ]
              : showSearch
                ? [
                    {
                      key: "n/N",
                      label: `${searchMatches.length ? searchIdx + 1 : 0}/${searchMatches.length}`,
                    },
                    { key: "Esc", label: "close" },
                  ]
                : visualMode
                  ? [
                      { key: "j/k", label: "extend" },
                      { key: "x", label: "toggle" },
                      { key: "V/Esc", label: "exit" },
                    ]
                  : [
                      { key: "j/k", label: "move" },
                      { key: "h", label: "sidebar" },
                      { key: "x", label: "toggle" },
                      { key: "z", label: "fold" },
                      { key: "J/K", label: "reorder" },
                      { key: "H/L", label: "phase" },
                      { key: "/", label: "search" },
                      { key: "e", label: "edit" },
                      { key: "d", label: "delete" },
                      { key: "?", label: "help" },
                    ]
        }
      />
    </div>
  );
}
