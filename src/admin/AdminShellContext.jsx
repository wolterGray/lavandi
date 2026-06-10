import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AdminConfirmDialog, AdminStatusToast } from "./adminUi";
import AdminCommandPalette from "./AdminCommandPalette";
import { adminRu } from "./adminStrings";

const AdminShellContext = createContext(null);

export function AdminShellProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [dirtyPages, setDirtyPages] = useState(() => new Set());
  const [confirmState, setConfirmState] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);

  const isAnyDirty = dirtyPages.size > 0;

  const showToast = useCallback((message, tone = "success") => {
    if (!message) return;
    setToast({ message, tone, id: Date.now() });
  }, []);

  const registerDirty = useCallback((pageId, isDirty) => {
    setDirtyPages((current) => {
      const next = new Set(current);
      if (isDirty) next.add(pageId);
      else next.delete(pageId);
      return next;
    });
  }, []);

  const requestConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const closeConfirm = useCallback((result) => {
    setConfirmState((current) => {
      current?.resolve?.(result);
      return null;
    });
  }, []);

  const confirmLeaveIfDirty = useCallback(() => {
    if (!isAnyDirty) return true;
    return window.confirm(adminRu.common.leaveUnsaved);
  }, [isAnyDirty]);

  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (!isAnyDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isAnyDirty]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo(
    () => ({
      showToast,
      registerDirty,
      requestConfirm,
      setCommandOpen,
      isAnyDirty,
      confirmLeaveIfDirty,
    }),
    [showToast, registerDirty, requestConfirm, isAnyDirty, confirmLeaveIfDirty]
  );

  return (
    <AdminShellContext.Provider value={value}>
      {children}
      <AdminStatusToast message={toast?.message} tone={toast?.tone} />
      <AdminCommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <AdminConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        cancelLabel={confirmState?.cancelLabel}
        variant={confirmState?.variant ?? "primary"}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);
  if (!context) {
    throw new Error("useAdminShell must be used within AdminShellProvider");
  }
  return context;
}
