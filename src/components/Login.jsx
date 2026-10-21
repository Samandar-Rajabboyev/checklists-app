const AUTH_ERRORS = {
  cancelled: "Sign-in was cancelled.",
  state: "Sign-in expired or was started in another tab. Please try again.",
  exchange: "Couldn't complete sign-in with the provider. Please try again.",
};

const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

export function Login() {
  const errorCode = new URLSearchParams(window.location.search).get("auth_error");
  const error = errorCode && (AUTH_ERRORS[errorCode] || "Sign-in failed. Please try again.");

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo serif">todo</div>
        <div className="login-tagline">
          Track a goal — a product launch, a study plan, a business milestone —
          broken into phases and tasks.
        </div>
        {error && <div className="login-error">{error}</div>}
        <a className="btn btn-dark login-btn" href="/api/auth/google">
          Continue with Google
        </a>
        <a className="btn btn-muted login-btn" href="/api/auth/github">
          Continue with GitHub
        </a>
        {/* Only works when the Worker runs with DEV_LOGIN=1 (.dev.vars). */}
        {isLocalhost && (
          <a className="btn btn-muted login-btn" href="/api/auth/dev">
            Dev login (local only)
          </a>
        )}
      </div>
    </div>
  );
}
