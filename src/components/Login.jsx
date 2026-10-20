export function Login() {
  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo serif">todo</div>
        <div className="login-tagline">
          Track a goal — a product launch, a study plan, a business milestone —
          broken into phases and tasks.
        </div>
        <a className="btn btn-dark login-btn" href="/api/auth/google">
          Continue with Google
        </a>
        <a className="btn btn-muted login-btn" href="/api/auth/github">
          Continue with GitHub
        </a>
      </div>
    </div>
  );
}
