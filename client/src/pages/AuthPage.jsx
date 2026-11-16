import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import { useAuth } from "../context/AuthContext.jsx";
import SocialAuthButtons from "../components/auth/SocialAuthButtons.jsx";
function LoopTyping({ text, typeMs = 70, eraseMs = 35, holdMs = 1800, pauseMs = 500 }) {
  const [visible, setVisible] = useState(text);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(text);
      return undefined;
    }
    let index = 0;
    let direction = 1;
    let timer;
    setVisible("");
    const tick = () => {
      index += direction;
      setVisible(text.slice(0, index));
      let delay = direction === 1 ? typeMs : eraseMs;
      if (direction === 1 && index >= text.length) {
        direction = -1;
        delay = holdMs;
      } else if (direction === -1 && index <= 0) {
        direction = 1;
        delay = pauseMs;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, typeMs);
    return () => clearTimeout(timer);
  }, [text, typeMs, eraseMs, holdMs, pauseMs]);
  return <>{visible}</>;
}
function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const isSignup = location.pathname === "/signup";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.search).get("oauth") === "failed"
      ? "Google authentication failed. Please try again."
      : ""
  );
  useEffect(() => {
    setError(
      new URLSearchParams(location.search).get("oauth") === "failed"
        ? "Google authentication failed. Please try again."
        : ""
    );
    setShowPassword(false);
  }, [location.pathname, location.search]);
  const changeMode = (mode) => {
    setError("");
    navigate(mode === "signup" ? "/signup" : "/login");
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await registerUser(formData);
      } else {
        await loginUser({
          email: formData.email,
          password: formData.password,
        });
      }
      await refreshUser();
      navigate("/workspace", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          (isSignup
            ? "Unable to create account. Please try again."
            : "Unable to sign in. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main
      className="auth-app grid lg:grid-cols-[1.05fr_1fr]"
      data-mode={isSignup ? "signup" : "login"}
    >
      {/* Lime accent touches (colour only) */}
      <style>{`
        .auth-app .glow{background:radial-gradient(circle at center,rgba(192,255,0,.18),transparent 65%)!important}
        .auth-app .t-c,.auth-app .t-s{color:#C0FF00!important}
        .auth-app .cursor{background:#C0FF00!important;box-shadow:0 0 8px rgba(192,255,0,.7)}
        .auth-app .input:focus{border-color:#C0FF00!important;box-shadow:0 0 0 3px rgba(192,255,0,.25)!important;outline:none}
        .auth-app{min-height:100vh;min-height:100svh;overflow-x:hidden}
        @media(max-width:1023px){.auth-app>section{min-height:100vh;min-height:100svh;width:100%}.auth-app>section>div:nth-child(2),.auth-app>section>div:nth-child(2)>div{width:100%}}
        @media(min-width:768px) and (max-width:1023px){.auth-app>section{padding:40px 48px}.auth-app>section>div:nth-child(2)>div{max-width:440px}}
        @media(max-width:767px){.auth-app>section{min-height:100vh;min-height:100svh;padding:20px 20px 24px}.auth-app>section>div:first-child{min-height:40px}.auth-app>section>div:nth-child(2){padding:28px 0}.auth-app>section>div:nth-child(2)>div{max-width:420px}.auth-app .swap.up{margin-bottom:24px}.auth-app .auth-social,.auth-app .input{width:100%;min-width:0}.auth-app form .btn{min-height:46px}.auth-app>section>p:last-child{max-width:360px;margin:0 auto;font-size:11px}}
        @media(max-width:380px){.auth-app>section{padding-left:16px;padding-right:16px}.auth-app .swap.up h1{font-size:24px}.auth-app .flex.items-center.gap-4.my-6{gap:10px}.auth-app .flex.items-center.gap-4.my-6 span:nth-child(2){white-space:nowrap;font-size:11px}}
      `}</style>
      {/* BRAND PANEL */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#09090b] text-[#f5f5f5] p-12 xl:p-14">
        <div className="grid-bg absolute inset-0" />
        <div className="glow absolute -top-20 -left-20 w-[640px] h-[640px] rounded-full" />
        {/* Brand */}
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 place-items-center rounded-[6px] border border-[#C0FF00]/35 bg-[#0b0f08] text-[#C0FF00] after:absolute after:-right-1.5 after:-top-1.5 after:h-3 after:w-3 after:rounded-full after:bg-[#C0FF00] after:shadow-[0_0_10px_rgba(192,255,0,0.55)] after:content-['']">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            ShipSafe
          </span>
        </Link>
        {/* Main content - SAME in Login and Signup */}
        <div className="relative max-w-[520px] rise">
          <div className="mb-10 min-h-[120px]">
            <h2 className="text-[34px] leading-[1.15] font-semibold tracking-[-0.03em]">
              Pick up exactly
              <br />
              where you left off.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#8a8a8f] max-w-[420px]">
              Your repositories, security reviews and scans are waiting.
              Sign in and ship safer code.
            </p>
          </div>
          {/* Terminal */}
          <div className="rounded-xl border border-[#C0FF00]/25 bg-white/[0.03] shadow-[0_0_40px_rgba(192,255,0,0.06)] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 px-4 h-10 border-b border-[#C0FF00]/15">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C0FF00]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="ml-3 font-mono text-[11px] text-[#6b7280]">
                terminal
              </span>
            </div>
            <div className="p-5 font-mono text-[12.5px] leading-[1.9] min-h-[168px]">
              <pre className="whitespace-pre-wrap">
                <span className="t-c">$</span>{" "}
                <span className="t-f">shipsafe auth login</span>
                {"\n"}
                <span className="t-c">→</span> Verifying session...
                {"\n"}
                <span className="t-s">✓</span> Welcome back
                {"\n"}
                <span className="t-c">$</span>{" "}
                <span className="t-f">shipsafe scan --repository</span>
                {"\n"}
                <span className="t-s">✓</span>{" "}
                <LoopTyping text="Security analysis ready" />{" "}
                <span className="cursor" />
              </pre>
            </div>
          </div>
        </div>
        {/* Bottom labels */}
        <div className="relative flex items-center gap-8 text-[12px] text-[#6b7280]">
          <span>Security-first</span>
          <span>Repository analysis</span>
          <span>Ship with confidence</span>
        </div>
      </aside>
      {/* FORM PANEL */}
      <section className="flex flex-col px-6 sm:px-10 py-8">
        {/* Top navigation */}
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <span className="relative grid h-9 w-9 place-items-center rounded-[6px] border border-[#C0FF00]/35 bg-[#0b0f08] text-[#C0FF00] after:absolute after:-right-1.5 after:-top-1.5 after:h-3 after:w-3 after:rounded-full after:bg-[#C0FF00] after:shadow-[0_0_10px_rgba(192,255,0,0.55)] after:content-['']">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </span>
            <span className="text-[15px] font-semibold tracking-tight">
              ShipSafe
            </span>
          </Link>
        </div>
        {/* Main form */}
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[380px]">
            {/* Heading */}
            <div className="swap up mb-8">
              <div data-for="login">
                <h1 className="text-[26px] font-semibold tracking-[-0.025em] leading-tight">
                  Welcome back
                </h1>
                <p className="mt-2 text-[14px] text-mute">
                  Sign in to continue to your workspace.
                </p>
              </div>
              <div data-for="signup">
                <h1 className="text-[26px] font-semibold tracking-[-0.025em] leading-tight">
                  Create your account
                </h1>
                <p className="mt-2 text-[14px] text-mute">
                  Start building safer software with ShipSafe.
                </p>
              </div>
            </div>
            {/* Toggle */}
            <div
              role="tablist"
              className="relative grid grid-cols-2 p-1 rounded-[11px] border border-line bg-field mb-6"
            >
              <span className="pill absolute top-1 bottom-1 left-1 rounded-[8px] bg-bg border border-[#C0FF00]/70 shadow-[0_0_14px_rgba(192,255,0,0.35)]" />
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                onClick={() => changeMode("login")}
                className="seg relative z-10 h-9 text-[13px] font-medium"
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                onClick={() => changeMode("signup")}
                className="seg relative z-10 h-9 text-[13px] font-medium"
              >
                Sign up
              </button>
            </div>
            {/* Social authentication */}
            <div className="auth-social">
              <SocialAuthButtons />
            </div>
            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[12px] text-mute">
                or continue with email
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* NAME */}
              <div className={`fold ${isSignup ? "active" : ""}`}>
                <div>
                  <div className="pb-4">
                    <label
                      htmlFor="name"
                      className="block text-[13px] font-medium mb-2"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      className="input"
                      type="text"
                      placeholder="Your name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isSignup}
                      required={isSignup}
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>
              {/* EMAIL */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-[13px] font-medium mb-2"
                >
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  className="input"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="pw"
                    className="text-[13px] font-medium"
                  >
                    Password
                  </label>
                  <div className={`fold ${!isSignup ? "active" : ""}`}>
                    <div>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-[12.5px] text-mute hover:text-fg transition-colors whitespace-nowrap pl-3"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="pw"
                    name="password"
                    className="input pr-11"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={isSignup ? 8 : undefined}
                    maxLength={isSignup ? 128 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-0 top-0 h-11 w-11 grid place-items-center text-mute hover:text-fg transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3l18 18M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 5.09A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.4 17.4 0 0 1-4.2 4.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.9 10.9 0 0 0 3.2-.48" />
                      </svg>
                    ) : (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Signup password helper */}
                <div className={`fold ${isSignup ? "active" : ""}`}>
                  <div>
                    <p className="pt-2 text-[12px] text-mute">
                      Use at least 8 characters.
                    </p>
                  </div>
                </div>
              </div>
              {/* ERROR */}
              {error && (
                <div className="mt-4 rounded-[10px] border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-[13px] text-red-400">{error}</p>
                </div>
              )}
              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="btn mt-6 w-full h-11 rounded-[10px] bg-ink text-onink text-[14px] font-medium shadow-[0_8px_24px\_-8px_rgba(192,255,0,0.6)] hover:opacity-90 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="swap">
                  <span data-for="login">
                    {loading ? "Signing in..." : "Continue"}
                  </span>
                  <span data-for="signup">
                    {loading ? "Creating account..." : "Create account"}
                  </span>
                </span>
              </button>
            </form>
            {/* Bottom switch */}
            <div className="swap mt-6 text-center text-[13px] text-mute">
              <p data-for="login">
                New to ShipSafe?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("signup")}
                  className="text-fg font-medium hover:underline decoration-[#C0FF00] decoration-2 underline-offset-4"
                >
                  Create an account
                </button>
              </p>
              <p data-for="signup">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className="text-fg font-medium hover:underline decoration-[#C0FF00] decoration-2 underline-offset-4"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
        {/* Terms and privacy */}
        <p className="text-center text-[12px] text-mute leading-relaxed">
          By continuing, you agree to our{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="underline decoration-[#C0FF00] underline-offset-4 hover:text-fg"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="underline decoration-[#C0FF00] underline-offset-4 hover:text-fg"
          >
            Privacy Policy
          </a>
          .
        </p>
      </section>
    </main>
  );
}
export default AuthPage;
