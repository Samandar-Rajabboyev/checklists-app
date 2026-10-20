import { useState, useEffect, useCallback } from "react";
import { SCHEMES, applyScheme } from "./constants.js";
import {
  loadData,
  loadScheme,
  saveScheme,
  loadMode,
  saveMode,
} from "./lib/storage.js";
import { api } from "./lib/api.js";
import { useAuth } from "./hooks/useAuth.js";
import { useGoals } from "./hooks/useGoals.js";
import { styles } from "./styles/classic.js";
import { modernStyles } from "./styles/modern.js";
import { plainStyles } from "./styles/plain.js";
import { HelpOverlay } from "./components/HelpOverlay.jsx";
import { Modal } from "./components/Modal.jsx";
import { Home } from "./components/Home.jsx";
import { Detail } from "./components/Detail.jsx";
import { PlainApp } from "./components/PlainApp.jsx";
import { Login } from "./components/Login.jsx";

// ──── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading: authLoading } = useAuth();

  return (
    <>
      <style>{styles}</style>
      {authLoading ? (
        <div className="login-loading">loading…</div>
      ) : user ? (
        <AuthedApp />
      ) : (
        <Login />
      )}
    </>
  );
}

function AuthedApp() {
  const {
    checklists,
    createChecklist,
    updateChecklist,
    changeChecklist,
    deleteChecklist,
    archiveChecklist,
    importChecklists,
    selectChecklist,
    replaceOne,
  } = useGoals();
  const [view, setView] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [modal, setModal] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [scheme, setScheme] = useState(loadScheme);
  const [uiMode, setUiMode] = useState(loadMode);
  const [importPrompt, setImportPrompt] = useState(false);

  // First login after the localStorage-only era: if there's legacy local
  // data and the account has no goals yet, offer to bring it over once.
  useEffect(() => {
    const legacy = loadData();
    const alreadyOffered = sessionStorage.getItem("import-offered");
    if (legacy.length > 0 && checklists.length === 0 && !alreadyOffered) {
      setImportPrompt(true);
    }
  }, [checklists.length]);

  const handleImportLegacy = async () => {
    sessionStorage.setItem("import-offered", "1");
    setImportPrompt(false);
    const legacy = loadData();
    await importChecklists(legacy);
  };
  const dismissImportPrompt = () => {
    sessionStorage.setItem("import-offered", "1");
    setImportPrompt(false);
  };

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
    selectChecklist(id);
  };
  const handleBack = () => {
    setView("home");
    setActiveId(null);
  };
  const handleSave = async (data) => {
    if (modal === "new") {
      const created = await createChecklist(data);
      setActiveId(created.id);
    } else {
      await updateChecklist(data);
      setActiveId(data.id);
    }
    setModal(null);
  };
  const handleDelete = async () => {
    await deleteChecklist(activeId);
    setView("home");
    setActiveId(null);
  };
  const handleArchive = () => archiveChecklist(activeId);
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
  const handleImport = (items) => importChecklists(items);
  const handleAddCheckin = async (goalId, note) => {
    const saved = await api.addCheckin(goalId, note);
    replaceOne(saved);
  };
  const handleDeleteCheckin = async (goalId, checkinId) => {
    const saved = await api.deleteCheckin(goalId, checkinId);
    replaceOne(saved);
  };

  const active = checklists.find((cl) => cl.id === activeId);

  return (
    <>
      {uiMode === "modern" && <style>{modernStyles}</style>}
      {uiMode === "plain" && <style>{plainStyles}</style>}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {importPrompt && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-title serif">Import local checklists?</div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
              We found checklists saved in this browser from before sign-in.
              Bring them into your account?
            </p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={dismissImportPrompt}>
                Skip
              </button>
              <button className="btn-save" onClick={handleImportLegacy}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
      {uiMode === "plain" ? (
        <PlainApp
          checklists={checklists}
          onSave={async (data, isNew) => {
            // Overloaded by PlainApp: 2-arg calls come from the modal
            // (full create/edit); 1-arg calls are bulk phase/task
            // mutations from keyboard nav, same shape as Detail.onChange.
            if (isNew === undefined) changeChecklist(data);
            else if (isNew) await createChecklist(data);
            else await updateChecklist(data);
          }}
          onDelete={(id) => deleteChecklist(id)}
          onArchive={(id) => archiveChecklist(id)}
          onExport={handleExport}
          onImport={handleImport}
          selectChecklist={selectChecklist}
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
      ) : active?.phases ? (
        <Detail
          checklist={active}
          onChange={changeChecklist}
          onBack={handleBack}
          onEdit={() => setModal("edit")}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onExport={handleExport}
          modalOpen={!!modal}
          uiMode={uiMode}
          onAddCheckin={handleAddCheckin}
          onDeleteCheckin={handleDeleteCheckin}
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
