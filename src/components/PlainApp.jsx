import { useState, useRef, useEffect, useMemo } from "react";
import { getProgress } from "../lib/storage.js";
import { KeyHintBar } from "./KeyHintBar.jsx";
import { Modal } from "./Modal.jsx";
import { PlainContent } from "./PlainContent.jsx";

// ──── Plain Mode App ─────────────────────────────────────────────────────────

export function PlainApp({
  checklists,
  onSave,
  onDelete,
  onArchive,
  onExport,
  onImport,
  onToggleMode,
  scheme,
  onCycleScheme,
  selectChecklist,
}) {
  const [activeId, setActiveId] = useState(checklists[0]?.id || null);

  // The sidebar list is summary-only (no phases/tasks — see
  // normalizeGoal in lib/api.js); fetch the full tree whenever the
  // selected goal changes, same as Detail's handleSelect in App.jsx.
  useEffect(() => {
    if (activeId) selectChecklist(activeId);
  }, [activeId, selectChecklist]);
  const [modal, setModal] = useState(null);
  const [sidebarFocus, setSidebarFocus] = useState(0);
  const [focusArea, setFocusArea] = useState("sidebar"); // sidebar | content
  const [filter, setFilter] = useState("active"); // active | all | archived
  const fileRef = useRef(null);

  const filteredChecklists = useMemo(() => checklists.filter((cl) => {
    if (filter === "active" && cl.archived) return false;
    if (filter === "archived" && !cl.archived) return false;
    return true;
  }), [checklists, filter]);

  const active = checklists.find((cl) => cl.id === activeId) || null;

  // ── Persist changes ────────────────────────────────────────────────────────
  const handleChange = (upd) => onSave(upd);
  const handleDelete = () => {
    const idx = checklists.findIndex((c) => c.id === activeId);
    onDelete(activeId);
    setActiveId(checklists[idx - 1]?.id || checklists[idx + 1]?.id || null);
  };
  const handleArchive = () => {
    if (active) onSave({ ...active, archived: !active.archived });
  };

  // ── Sidebar keyboard nav ────────────────────────────────────────────────────
  useEffect(() => {
    if (focusArea !== "sidebar") return;
    const h = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      )
        return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSidebarFocus((i) => Math.min(i + 1, filteredChecklists.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSidebarFocus((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "l" || e.key === "ArrowRight") {
        e.preventDefault();
        if (filteredChecklists[sidebarFocus]) {
          setActiveId(filteredChecklists[sidebarFocus].id);
          setFocusArea("content");
        }
      } else if (e.key === "n") {
        e.preventDefault();
        setModal("new");
      } else if (e.key === "i") {
        e.preventDefault();
        fileRef.current?.click();
      } else if (e.key === "Tab") {
        e.preventDefault();
        setFilter((f) =>
          f === "active" ? "all" : f === "all" ? "archived" : "active",
        );
        setSidebarFocus(0);
      } else if (e.key === "T") {
        e.preventDefault();
        onCycleScheme();
      } else if (e.key === "M") {
        e.preventDefault();
        onToggleMode();
      } else if (e.key === "g") setSidebarFocus(0);
      else if (e.key === "G") setSidebarFocus(filteredChecklists.length - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [focusArea, sidebarFocus, filteredChecklists, onCycleScheme, onToggleMode]);

  // Sync sidebarFocus with activeId
  useEffect(() => {
    const idx = filteredChecklists.findIndex((cl) => cl.id === activeId);
    if (idx !== -1) setSidebarFocus(idx);
  }, [activeId, filteredChecklists]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const items = Array.isArray(data) ? data : [data];
        onImport(items);
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="plain-layout">
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Sidebar */}
      <div className="plain-sidebar" onClick={() => setFocusArea("sidebar")}>
        <div className="plain-sidebar-title">
          checklists
          <span style={{ opacity: 0.4, fontSize: "0.65rem", marginLeft: "4px" }}>
            [{filter}]
          </span>
        </div>
        {filteredChecklists.map((cl, idx) => {
          const { done, total } = getProgress(cl);
          return (
            <div
              key={cl.id}
              className={`plain-sidebar-item${cl.id === activeId ? " active" : ""}${focusArea === "sidebar" && sidebarFocus === idx ? " focused" : ""}`}
              onClick={() => {
                setActiveId(cl.id);
                setSidebarFocus(idx);
                setFocusArea("content");
              }}
            >
              <span className="si-icon">{cl.archived ? "□" : "▪"}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {cl.title}
              </span>
              <span className="si-progress">
                {done}/{total}
              </span>
            </div>
          );
        })}
        <div className="plain-sidebar-new">
          <button onClick={() => setModal("new")}>+ new</button>
        </div>
        <KeyHintBar
          mode={focusArea === "sidebar" ? "SIDEBAR" : "--"}
          hints={
            focusArea === "sidebar"
              ? [
                  { key: "j/k", label: "nav" },
                  { key: "l/Enter", label: "open" },
                  { key: "n", label: "new" },
                  { key: "Tab", label: `filter:${filter}` },
                  { key: "M", label: "mode" },
                  { key: "T", label: "theme" },
                ]
              : []
          }
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={() => setFocusArea("content")}
      >
        {active?.phases ? (
          <PlainContent
            key={active.id}
            cl={active}
            handleChange={handleChange}
            handleDelete={handleDelete}
            handleArchive={handleArchive}
            onExport={onExport}
            setModal={setModal}
            focusArea={focusArea}
            setFocusArea={setFocusArea}
          />
        ) : (
          <div className="plain-home-main">
            <div className="plain-home-hint">
              select a checklist from the sidebar
              <br />
              <span style={{ opacity: 0.4 }}>
                j/k navigate · l/Enter open · n new
              </span>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          initial={modal === "edit" ? active : null}
          onSave={(data) => {
            if (modal === "new") {
              onSave(data, true);
            } else {
              onSave(data, false);
            }
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
