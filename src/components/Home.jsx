import { useState, useRef, useEffect } from "react";
import { SCHEMES } from "../constants.js";
import { uid, loadView, saveView, getProgress } from "../lib/storage.js";
import { KeyHintBar } from "./KeyHintBar.jsx";

// ──── Home ────────────────────────────────────────────────────────────────────

export function Home({
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
        const nv =
          view === "grid" ? "list" : view === "list" ? "compact" : "grid";
        setAndSaveView(nv);
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
      <div className="topbar">
        <div className="topbar-brand">
          <span className="topbar-logo">✦</span>
          <h1 className="topbar-title serif">Checklists</h1>
        </div>
        <div className="topbar-nav">
          {["active", "all", "archived"].map((f) => (
            <button
              key={f}
              className={`topbar-nav-btn${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="topbar-actions">
          {importErr && <span className="err-msg">{importErr}</span>}
          <div className="topbar-views">
            {[
              ["grid", "▦"],
              ["list", "▤"],
              ["compact", "▣"],
            ].map(([v, icon]) => (
              <button
                key={v}
                className={`topbar-view-btn${view === v ? " active" : ""}`}
                onClick={() => setAndSaveView(v)}
                title={v}
              >
                {icon}
              </button>
            ))}
          </div>
          <div className="topbar-divider" />
          <div className="scheme-picker">
            {SCHEMES.map((s) => (
              <div
                key={s.id}
                className={`scheme-dot${s.id === scheme?.id ? " active" : ""}`}
                style={{ background: s.bg }}
                title={s.name}
                onClick={() => onCycleScheme(s)}
              />
            ))}
          </div>
          <button
            className="mode-toggle-btn"
            onClick={onToggleMode}
            title={`Switch to ${uiMode === "classic" ? "modern" : "classic"} mode`}
          >
            {uiMode === "classic" ? "◈" : uiMode === "modern" ? "◫" : "◇"}
          </button>
          <div className="topbar-divider" />
          <button
            className="topbar-import-btn"
            onClick={() => fileRef.current?.click()}
            title="Import JSON"
          >
            ↑ Import
          </button>
          <button className="topbar-new-btn" onClick={onNew}>
            + New
          </button>
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
