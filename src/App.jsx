import { useState, useEffect, useCallback } from "react";
import { SCHEMES, applyScheme } from "./constants.js";
import {
  uid,
  loadData,
  saveData,
  loadScheme,
  saveScheme,
  loadMode,
  saveMode,
} from "./lib/storage.js";
import { styles } from "./styles/classic.js";
import { modernStyles } from "./styles/modern.js";
import { plainStyles } from "./styles/plain.js";
import { HelpOverlay } from "./components/HelpOverlay.jsx";
import { Modal } from "./components/Modal.jsx";
import { Home } from "./components/Home.jsx";
import { Detail } from "./components/Detail.jsx";
import { PlainApp } from "./components/PlainApp.jsx";

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
    document.body.classList.toggle("plain", uiMode === "plain");
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
          const n =
            m === "classic" ? "modern" : m === "modern" ? "plain" : "classic";
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
      {uiMode === "plain" && <style>{plainStyles}</style>}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {uiMode === "plain" ? (
        <PlainApp
          checklists={checklists}
          onSave={(data, isNew) => {
            if (isNew) persist([...checklists, data]);
            else
              persist(checklists.map((cl) => (cl.id === data.id ? data : cl)));
          }}
          onDelete={(id) => persist(checklists.filter((cl) => cl.id !== id))}
          onArchive={(id) =>
            persist(
              checklists.map((cl) =>
                cl.id === id ? { ...cl, archived: !cl.archived } : cl,
              ),
            )
          }
          onExport={handleExport}
          onImport={handleImport}
          onToggleMode={() =>
            setUiMode((m) => {
              const n =
                m === "classic"
                  ? "modern"
                  : m === "modern"
                    ? "plain"
                    : "classic";
              saveMode(n);
              return n;
            })
          }
          scheme={scheme}
          onCycleScheme={cycleScheme}
        />
      ) : view === "home" ? (
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
              const n =
                m === "classic"
                  ? "modern"
                  : m === "modern"
                    ? "plain"
                    : "classic";
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
