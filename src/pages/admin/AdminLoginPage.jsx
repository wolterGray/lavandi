import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../admin/AdminAuthContext";
import { adminRu } from "../../admin/adminStrings";
import { AdminButton, AdminField, AdminPanel, adminInputClass } from "../../admin/adminUi";

export default function AdminLoginPage() {
  const { isAuthenticated, authLoading, isSupabaseAuth, ssoError, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-5 text-sm text-stone">
        {adminRu.common.connectingSupabase}
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login({ email, password });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? adminRu.auth.loginFailed);
      return;
    }

    const redirect = location.state?.from || "/admin";
    navigate(redirect, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-5">
      <AdminPanel className="w-full max-w-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">NUAR Admin</p>
        <h1 className="mt-2 font-display text-3xl text-milk">{adminRu.auth.login}</h1>
        <p className="mt-3 text-sm text-stone">
          {isSupabaseAuth ? adminRu.auth.supabaseHint : adminRu.auth.localHint}
        </p>
        {isSupabaseAuth && (
          <p className="mt-2 text-xs text-muted">
            {adminRu.auth.crmSsoHint}
          </p>
        )}

        {ssoError && <p className="mt-4 text-sm text-red-300">{ssoError}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isSupabaseAuth && (
            <AdminField label="Email">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                className={adminInputClass()}
                autoComplete="email"
                required
              />
            </AdminField>
          )}

          <AdminField label={adminRu.auth.password}>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              className={adminInputClass()}
              autoComplete="current-password"
              required
            />
          </AdminField>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <AdminButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? adminRu.auth.loggingIn : adminRu.auth.enterPanel}
          </AdminButton>
        </form>
      </AdminPanel>
    </div>
  );
}
