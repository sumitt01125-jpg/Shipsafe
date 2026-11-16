import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, Menu, Plus, Terminal, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const landingNavLinks = [
  ["Platform", "#product"],
  ["Workspace", "#workspace"],
  ["Assistant", "#assistant"],
  ["How it works", "#how"],
];

// Shared brand mark used by the Landing page and its previews.
export function BrandMark({ small = false }) {
  return (
    <span className={`ss-brand-mark ${small ? "ss-brand-mark-sm" : ""}`}>
      <Terminal size={small ? 15 : 17} strokeWidth={2.1} />
      <i />
    </span>
  );
}

// 1. LANDING PAGE NAVBAR
function LandingNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="ss-nav-wrap">
      <nav className="ss-nav" aria-label="Main">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <BrandMark />
          <b className="text-[15px] font-semibold tracking-[-0.02em] text-[#f2f4ef]">ShipSafe</b>
        </Link>

        <div className="ss-nav-links">
          {landingNavLinks.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/workspace" className="ss-nav-login">Workspace</Link>
              <Link to="/dashboard" className="ss-nav-login">Dashboard</Link>
              <button type="button" onClick={handleLogout} className="ss-nav-login inline-flex items-center gap-1.5">
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="ss-nav-login">Log in</Link>
              <Link to="/signup" className="ss-nav-cta">
                Get started <ArrowUpRight size={14} />
              </Link>
            </>
          )}
          <button
            type="button"
            className="ss-nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <span className="ss-nav-progress" aria-hidden="true" />
      </nav>

      {open && (
        <div className="ss-nav-mobile">
          {landingNavLinks.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          {user ? (
            <>
              <Link to="/workspace" onClick={() => setOpen(false)}>Workspace</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              <button type="button" onClick={handleLogout} className="px-[13px] py-[11px] text-left text-sm text-[#d5dbd0]">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
              <Link to="/signup" onClick={() => setOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

// 2. DASHBOARD PAGE NAVBAR
export function DashboardNavbar({ user, initials }) {
  return (
    <>
      <style>{`
        .dash-nav { position:relative; isolation:isolate; animation:dashNavEnter .5s both; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.14); border-top:0; -webkit-backdrop-filter:blur(24px) saturate(150%); backdrop-filter:blur(24px) saturate(150%); box-shadow:0 12px 40px rgba(0,0,0,.45),inset 0 -1px 0 rgba(255,255,255,.08); }
        .dash-nav-brand-mark { background:linear-gradient(145deg,rgba(192,255,0,.07),rgba(192,255,0,.02)),#0b0f08; border-color:rgba(192,255,0,.35); box-shadow:none; }
        .dash-nav-brand-mark::after { content:""; position:absolute; top:-4px; right:-4px; width:9px; height:9px; border-radius:50%; background:#C0FF00; box-shadow:0 0 10px rgba(192,255,0,.55); }
        .dash-nav-brand-mark:hover { border-color:#C0FF00; background:rgba(192,255,0,.14); }
        .dash-nav-workspace-pill { background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.12); }
        .dash-nav-workspace-pill span:last-child { color:rgba(230,236,228,.78); }
        .dash-nav-dot { background:#39FF14; box-shadow:0 0 10px 2px rgba(57,255,20,.65); animation:dashNavDotBlink 1.3s ease-in-out infinite; }
        .dash-nav-new-scan { position:relative; isolation:isolate; overflow:hidden; border:1px solid #C0FF00; background:rgba(192,255,0,.04); color:#C0FF00; transition:color .3s ease,transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s ease,border-color .3s ease; }
        .dash-nav-new-scan::before { content:""; position:absolute; z-index:-1; inset:0; background:#C0FF00; transform:scaleY(0); transform-origin:bottom; transition:transform .38s cubic-bezier(.2,.8,.2,1); }
        .dash-nav-new-scan:hover::before { transform:scaleY(1); }
        .dash-nav-new-scan:hover { color:#0a0c06; border-color:#C0FF00; transform:translateY(-2px); box-shadow:0 10px 30px rgba(192,255,0,.22); }
        .dash-nav-new-scan:active { transform:translateY(0) scale(.98); }
        .dash-nav-profile { background:linear-gradient(145deg,#d6ff4d,#C0FF00 60%,#9ad100); color:#0a0c06; border:1px solid rgba(255,255,255,.35); box-shadow:0 5px 18px rgba(192,255,0,.2); }
        @keyframes dashNavDotBlink { 0%,100% { opacity:1; } 50% { opacity:.25; } }
        @keyframes dashNavEnter { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @media (prefers-reduced-motion:reduce) { .dash-nav-dot,.dash-nav,.dash-nav-new-scan,.dash-nav-new-scan::before { animation:none; transition:none; } }
      `}</style>

      <header className="dash-nav mx-auto -mt-4 mb-10 flex w-full max-w-[960px] flex-wrap items-center gap-3 rounded-b-[16px] rounded-t-none px-4 py-2 text-[#f2f4ef] sm:-mt-7 sm:mb-14 sm:px-4">
        <Link to="/workspace" className="group flex w-fit items-center gap-3">
          <span className="dash-nav-brand-mark relative grid h-8 w-8 place-items-center rounded-[5px] border text-[#C0FF00] transition">
            <Terminal size={17} strokeWidth={2.1} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#f2f4ef]">ShipSafe</span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="dash-nav-workspace-pill hidden items-center gap-2 rounded-full border px-3 py-2 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF14] opacity-40" />
              <span className="dash-nav-dot relative h-2 w-2 rounded-full" />
            </span>
            <span className="text-[11px] font-semibold text-[#b4bcb2]">Workspace active</span>
          </div>
          <Link to="/workspace" className="dash-nav-new-scan inline-flex h-9 items-center gap-2 rounded-[9px] px-3.5 text-[12px] font-bold sm:px-4">
            <Plus size={14} />New scan
          </Link>
          <div title={user?.email || "Account"} className="dash-nav-profile grid h-10 w-10 place-items-center rounded-full text-[12px] font-bold">
            {initials}
          </div>
        </div>
      </header>
    </>
  );
}

// 3. WORKSPACE PAGE NAVBAR
export function WorkspaceNavbar({ sidebarCollapsed, setSidebarCollapsed, thinking }) {
  return (
    <header className="relative z-20 flex h-[60px] shrink-0 items-center justify-center bg-[#080b0a]/95 px-5 backdrop-blur-xl md:px-7">
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="absolute left-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.025] text-slate-400 transition-all duration-200 hover:border-[#C0FF00]/50 hover:bg-[#C0FF00]/[0.10] hover:text-[#C0FF00]"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>
      )}

      <nav className="relative flex h-[50px] w-full max-w-[960px] items-center justify-between gap-3 rounded-b-2xl border border-t-0 border-white/[0.10] bg-white/[0.06] px-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#C0FF00]/35 bg-[#0b0f08] text-[#C0FF00]">
            <Terminal size={17} strokeWidth={2.1} />
            <span className="absolute -right-1 -top-1 h-[9px] w-[9px] rounded-full bg-[#C0FF00] shadow-[0_0_8px_rgba(192,255,0,0.55)]" />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#f2f4ef]">ShipSafe</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-lime-400 bg-lime-400/[0.08] border border-lime-400/10 px-3 py-2 rounded-full">
              <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
              {thinking ? "Analyzing..." : "Scanner Ready"}
            </div>
      </nav>
    </header>
  );
}

// Default export is intentionally the Landing page navbar only.
export default function Navbar() {
  return (
    <>
      <style>{`
        .ss-nav-wrap{position:fixed;top:0;left:0;right:0;z-index:50;padding:0 12px;pointer-events:none}
        .ss-nav{position:relative;overflow:hidden;pointer-events:auto;margin:0 auto;max-width:960px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 8px 8px 16px;border:1px solid rgba(255,255,255,.10);border-top:0;border-radius:0 0 16px 16px;background:rgba(255,255,255,.06);-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);box-shadow:0 10px 30px rgba(0,0,0,.35),inset 0 -1px 0 rgba(255,255,255,.05)}
        .ss-nav-progress{position:absolute;left:0;bottom:0;width:100%;height:2px;transform:scaleX(0);transform-origin:left center;background:linear-gradient(90deg,#8fc900 0%,#c0ff00 58%,#e2ff83 100%);box-shadow:0 0 9px rgba(192,255,0,.75),0 0 18px rgba(192,255,0,.28);pointer-events:none;will-change:transform}
        .ss-nav-links{display:flex;gap:2px}.ss-nav-links a{font-size:13px;font-weight:500;color:#a7b0a2;padding:7px 12px;border-radius:9px;transition:color .2s,background .2s}.ss-nav-links a:hover{color:#f2f4ef;background:rgba(255,255,255,.06)}
        .ss-nav-login{font-size:13px;font-weight:500;color:#c9d0c4;padding:7px 12px;border-radius:9px;transition:color .2s,background .2s}.ss-nav-login:hover{color:#f2f4ef;background:rgba(255,255,255,.06)}
        .ss-nav-cta{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(192,255,0,.55);background:transparent;color:#c0ff00;border-radius:9px;padding:7px 13px;font-size:13px;font-weight:600;transition:background .25s,color .25s,border-color .25s}.ss-nav-cta:hover{background:#c0ff00;border-color:#c0ff00;color:#0a0c06}
        .ss-nav-burger{display:none;width:34px;height:34px;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:9px;color:#e8ede3;background:rgba(255,255,255,.05)}
        .ss-nav-mobile{pointer-events:auto;margin:8px auto 0;max-width:960px;display:grid;gap:2px;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(12,16,12,.92);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px)}.ss-nav-mobile a{padding:11px 13px;border-radius:9px;font-size:14px;color:#d5dbd0}.ss-nav-mobile a:hover{background:rgba(255,255,255,.06);color:#f2f4ef}
        .ss-brand-mark{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;position:relative;border:1px solid rgba(192,255,0,.35);border-radius:5px;color:#c0ff00;background:linear-gradient(145deg,rgba(192,255,0,.07),rgba(192,255,0,.02)),#0b0f08}.ss-brand-mark i{position:absolute;width:9px;height:9px;border-radius:50%;background:#c0ff00;right:-4px;top:-4px;box-shadow:0 0 8px rgba(192,255,0,.55)}.ss-brand-mark-sm{width:28px;height:28px}.ss-brand-mark-sm i{width:8px;height:8px;right:-4px;top:-4px}
        @media(max-width:767px){.ss-nav-links,.ss-nav-login{display:none}.ss-nav-burger{display:grid}.ss-nav{padding:7px 7px 7px 12px}}
        @media(prefers-reduced-motion:reduce){.ss-nav-progress{transform:scaleX(1)}}
      `}</style>
      <LandingNav />
    </>
  );
}
