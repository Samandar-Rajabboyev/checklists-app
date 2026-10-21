import { useState, useEffect, useCallback } from "react";
import { SCHEMES, applyScheme } from "./constants.js";
import {
  ls,
  loadData,
  loadScheme,
  saveScheme,
  loadMode,
  saveMode,
} from "./lib/storage.js";
import { useAuth } from "./hooks/useAuth.js";
import { useGoals } from "./hooks/useGoals.js";
import { styles } from "./styles/classic.js";
import { plainStyles } from "./styles/plain.js";
import { HelpOverlay } from "./components/HelpOverlay.jsx";
import { Modal } from "./components/Modal.jsx";
import { Home } from "./components/Home.jsx";
import { Detail } from "./components/Detail.jsx";
import { PlainApp } from "./components/PlainApp.jsx";
import { Login } from "./components/Login.jsx";

// ──── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();

  // Applied here (not just in AuthedApp) so the login and loading screens
  // get the theme's CSS variables too.
  useEffect(() => {
    applyScheme(loadScheme());
  }, []);

  return (
    <>
      <style>{styles}</style>
      {authLoading ? (
        <div className="login-loading">loading…</div>
      ) : user ? (
        <AuthedApp user={user} onLogout={logout} />
      ) : (
        <Login />
      )}
    </>
  );
}

function AuthedApp({ user, onLogout }) {
  const {
    checklists,
    loading,
    loadError,
    syncError,
    clearSyncError,
    reload,
    createChecklist,
    updateChecklist,
    changeChecklist,
    deleteChecklist,
    archiveChecklist,
    importChecklists,
    selectChecklist,
    addCheckin,
    deleteCheckin,
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
    if (loading || loadError) return;
    const legacy = loadData();
    const alreadyOffered = ls.get("import-offered");
    if (legacy.length > 0 && checklists.length === 0 && !alreadyOffered) {
      setImportPrompt(true);
    }
  }, [loading, loadError, checklists.length]);

  // Auto-dismiss the sync error toast.
  useEffect(() => {
    if (!syncError) return;
    const t = setTimeout(clearSyncError, 5000);
    return () => clearTimeout(t);
  }, [syncError, clearSyncError]);

  const handleImportLegacy = async () => {
    ls.set("import-offered", "1");
    setImportPrompt(false);
    const legacy = loadData();
    await importChecklists(legacy).catch(() => {});
  };
  const dismissImportPrompt = () => {
    ls.set("import-offered", "1");
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
          const n = m === "plain" ? "classic" : "plain";
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
    const isNew = modal === "new";
    setModal(null);
    if (isNew) {
      const created = await createChecklist(data).catch(() => null);
      if (created) handleSelect(created.id);
    } else {
      updateChecklist(data);
    }
  };
  const handleDelete = async () => {
    await deleteChecklist(activeId);
    setView("home");
    setActiveId(null);
  };
  const handleArchive = () => archiveChecklist(activeId);
  // Detail passes the click event; PlainContent passes the goal id.
  const handleExport = (id) => {
    const goalId = typeof id === "string" ? id : activeId;
    const cl = checklists.find((c) => c.id === goalId);
    if (!cl) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(cl, null, 2)], { type: "application/json" }),
    );
    a.download = `${cl.title.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
  };
  const handleImport = (items) => importChecklists(items).catch(() => {});
  const toggleMode = () =>
    setUiMode((m) => {
      const n = m === "plain" ? "classic" : "plain";
      saveMode(n);
      return n;
    });

  const active = checklists.find((cl) => cl.id === activeId);

  if (loadError) {
    return (
      <div className="login-loading" style={{ flexDirection: "column", gap: 12 }}>
        <div>Couldn't load your goals: {loadError}</div>
        <button className="btn btn-muted" onClick={reload}>
          Retry
        </button>
      </div>
    );
  }
  if (loading) return <div className="login-loading">loading…</div>;

  return (
    <>
      {uiMode === "plain" && <style>{plainStyles}</style>}
      {syncError && (
        <div className="sync-toast" onClick={clearSyncError}>
          Couldn't save: {syncError}
        </div>
      )}
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
          onToggleMode={toggleMode}
          scheme={scheme}
          onCycleScheme={cycleScheme}
          user={user}
          onLogout={onLogout}
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
          onToggleMode={toggleMode}
          user={user}
          onLogout={onLogout}
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
          onAddCheckin={addCheckin}
          onDeleteCheckin={deleteCheckin}
        />
      ) : (
        <div className="login-loading">loading…</div>
      )}
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
