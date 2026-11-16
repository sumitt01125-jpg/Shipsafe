import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GitBranch,
  Loader2,
  Plus,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { DashboardNavbar } from "../components/layout/Navbar.jsx";

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getFirstName = (user) =>
  user?.name?.trim()?.split(/\s+/)[0] ||
  user?.fullName?.trim()?.split(/\s+/)[0] ||
  user?.email?.split("@")[0] ||
  "there";

const getInitials = (user) => {
  const value = user?.name || user?.fullName || user?.email || "S";
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const formatRelativeDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  const minutes = Math.floor(Math.max(0, Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const statusStyles = {
  COMPLETED: { label: "Completed", badge: "border-emerald-400/25 bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-500" },
  FAILED: { label: "Failed", badge: "border-rose-400/25 bg-rose-500/15 text-rose-300", dot: "bg-rose-500" },
  RUNNING: { label: "Running", badge: "border-sky-400/25 bg-sky-500/15 text-sky-300", dot: "bg-sky-500 animate-pulse" },
  PENDING: { label: "Pending", badge: "border-white/10 bg-white/[0.07] text-zinc-300", dot: "bg-zinc-400" },
};

const severityItems = [
  { key: "CRITICAL", label: "Critical", color: "#FB7185", bar: "bg-rose-400", dot: "bg-rose-400" },
  { key: "HIGH", label: "High", color: "#FB923C", bar: "bg-orange-400", dot: "bg-orange-400" },
  { key: "MEDIUM", label: "Medium", color: "#FBBF24", bar: "bg-amber-400", dot: "bg-amber-400" },
  { key: "LOW", label: "Low", color: "#C0FF00", bar: "bg-[#C0FF00]", dot: "bg-[#C0FF00]" },
];

/* True one paint after mount, so width transitions can play from 0 */
function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let second;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  return ready;
}

const isSmallScreen = () =>
  typeof window !== "undefined" && Boolean(window.matchMedia?.("(max-width: 767px)").matches);

/* Cursor-follow spotlight used by every glass card */
const spotlight = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
};

function AnimatedNumber({ value }) {
  const [shown, setShown] = useState(() => (isSmallScreen() ? safeNumber(value) : 0));
  useEffect(() => {
    const target = safeNumber(value);
    if (isSmallScreen()) {
      setShown(target);
      return undefined;
    }
    const duration = 1100;
    let frame;
    let start;
    const animate = (time) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setShown(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{shown.toLocaleString("en-IN")}</>;
}

function GrowBar({ pct, className = "", delay = 0 }) {
  const ready = useReady();
  const instant = isSmallScreen();
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${className}`}
        style={{
          width: ready || instant ? `${pct}%` : "0%",
          transition: instant ? "none" : `width 1.1s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
        }}
      />
    </div>
  );
}

function GlassPanel({ children, className = "", ...props }) {
  return (
    <section
      {...props}
      onMouseMove={spotlight}
      className={`glass-panel relative isolate overflow-hidden rounded-[20px] border border-white/10 backdrop-blur-[30px] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold tracking-[-0.025em] text-[#f2f4ef]">{title}</h2>
        {description && <p className="mt-1 text-[12px] leading-5 text-[#9aa39a]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const statCards = [
  { key: "repositories", title: "Repositories", description: "Connected repositories", icon: GitBranch },
  { key: "scans", title: "Total scans", description: "All repository scans", icon: ScanSearch },
  { key: "issues", title: "Issues found", description: "Across all scans", icon: AlertTriangle },
  { key: "completed", title: "Completed scans", description: "Successfully completed", icon: CheckCircle2 },
];

function StatCard({ title, value, description, icon: Icon, index }) {
  return (
    <article
      onMouseMove={spotlight}
      style={{ "--i": index }}
      className="glass-card glass-panel group relative min-h-[112px] overflow-hidden rounded-[18px] border p-3.5 sm:min-h-[118px] sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-[12px] font-semibold text-[#c9d0c5]">{title}</p>
        <span className="stat-icon grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-[#C0FF00] transition duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
          <Icon size={16} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-3.5 text-[24px] font-bold leading-none sm:mt-4 sm:text-[28px] tracking-[-0.06em] text-[#f2f4ef]">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-2 truncate text-[11px] text-[#9aa39a]">{description}</p>
    </article>
  );
}

function SeverityDonut({ security, total }) {
  const background = useMemo(() => {
    if (!total) return "conic-gradient(#343b36 0% 100%)";
    let current = 0;
    const segments = severityItems.map((item) => {
      const start = current;
      current += (safeNumber(security[item.key]) / total) * 100;
      return `${item.color} ${start}% ${current}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [total, security]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-[150px] w-[150px]">
        {/* Ring sweeps in; the hole is a sibling so it is not masked */}
        <div className="donut-ring absolute inset-0 rounded-full" style={{ background }} />
        <div className="absolute inset-[14px] grid place-items-center rounded-full border border-white/15 bg-[#101513] shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
          <div className="text-center">
            <p className="text-[28px] font-bold leading-none tracking-[-0.06em] text-[#f2f4ef]"><AnimatedNumber value={total} /></p>
            <p className="mt-1.5 text-[10px] text-[#9aa39a]">Total findings</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9aa39a]">Severity distribution</p>
    </div>
  );
}

function ScanStatusCard({ scans }) {
  const ready = useReady() || isSmallScreen();
  const counts = useMemo(() => scans.reduce((result, scan) => {
    const status = String(scan.status || "PENDING").toUpperCase();
    if (status === "COMPLETED") result.completed += 1;
    else if (status === "FAILED") result.failed += 1;
    else if (status === "RUNNING") result.running += 1;
    else result.pending += 1;
    return result;
  }, { completed: 0, failed: 0, running: 0, pending: 0 }), [scans]);
  const total = scans.length;
  const segments = [
    { label: "Completed", value: counts.completed, color: "bg-emerald-500" },
    { label: "Running", value: counts.running, color: "bg-sky-400" },
    { label: "Pending", value: counts.pending, color: "bg-amber-400" },
    { label: "Failed", value: counts.failed, color: "bg-rose-500" },
  ];

  return (
    <GlassPanel className="p-5">
      <SectionHeading title="Scan health" description="Status of your latest scans" />
      <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/10">
        {segments.map((item, index) => (
          <div
            key={item.label}
            className={item.color}
            style={{
              width: ready && total ? `${(item.value / total) * 100}%` : "0%",
              transition: isSmallScreen() ? "none" : `width 1.1s cubic-bezier(.2,.8,.2,1) ${index * 110}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {segments.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-[12px] text-[#b4bcb2]"><span className={`h-2 w-2 rounded-full ${item.color}`} />{item.label}</span>
            <span className="text-[13px] font-bold text-[#f2f4ef]">{item.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-white/10 pt-3.5 text-[11px] leading-5 text-[#9aa39a]">Based on the {total} most recent scan{total === 1 ? "" : "s"} shown in your dashboard.</p>
    </GlassPanel>
  );
}

function EmptyScans({ onScan }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-[#C0FF00]"><GitBranch size={21} /></div>
      <h3 className="text-[14px] font-bold text-[#f2f4ef]">No scans yet</h3>
      <p className="mt-2 max-w-sm text-[12px] leading-6 text-[#9aa39a]">Connect a repository and run your first security scan. Your recent analysis history will show up here.</p>
      <button type="button" onClick={onScan} className="premium-btn mt-5 inline-flex h-10 items-center gap-2 rounded-full px-4 text-[12px] font-bold"><Plus size={14} />Start your first scan</button>
    </div>
  );
}

const SCENE_CSS = `.scene { background: radial-gradient(900px 520px at 8% 2%, rgba(192,255,0,.15), transparent 62%), radial-gradient(760px 560px at 96% 12%, rgba(150,112,72,.20), transparent 65%), radial-gradient(760px 520px at 55% 108%, rgba(192,255,0,.07), transparent 70%), linear-gradient(160deg, #0d100a 0%, #090a07 55%, #110d09 100%); }`;

function DashboardSkeleton() {
  return (
    <div className="scene min-h-screen overflow-hidden p-5 sm:p-8">
      <style>{SCENE_CSS}</style>
      <div className="mx-auto max-w-[1320px] animate-pulse">
        <div className="mb-8 flex items-center justify-between"><div className="h-10 w-36 rounded-full bg-white/10" /><div className="h-10 w-32 rounded-full bg-white/10" /></div>
        <div className="mb-6 h-28 rounded-[24px] bg-white/[0.06]" />
        <div className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-[118px] rounded-[18px] bg-white/[0.06]" />)}</div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.85fr)]"><div className="h-72 rounded-[20px] bg-white/[0.06]" /><div className="h-72 rounded-[20px] bg-white/[0.06]" /></div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const firstName = getFirstName(user);
  const initials = getInitials(user);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/dashboard");
      if (!response?.dashboard) throw new Error("Dashboard data could not be loaded.");
      setDashboard(response.dashboard);
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await apiRequest("/auth/account", { method: "DELETE" });
      try { await logout(); } catch { /* Account may already have been deleted. */ }
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(err.message || "Unable to delete your account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showDeleteModal) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !deleting) {
        setShowDeleteModal(false);
        setDeleteError("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showDeleteModal, deleting]);

  const overview = dashboard?.overview || {};
  const security = {
    CRITICAL: safeNumber(dashboard?.security?.CRITICAL),
    HIGH: safeNumber(dashboard?.security?.HIGH),
    MEDIUM: safeNumber(dashboard?.security?.MEDIUM),
    LOW: safeNumber(dashboard?.security?.LOW),
  };
  const recentScans = Array.isArray(dashboard?.recentScans) ? dashboard.recentScans : [];
  const totalFindings = Object.values(security).reduce((sum, value) => sum + value, 0);
  const stats = [
    { ...statCards[0], value: overview.totalRepositories ?? 0 },
    { ...statCards[1], value: overview.totalScans ?? 0 },
    { ...statCards[2], value: overview.totalFindings ?? totalFindings },
    { ...statCards[3], value: overview.completedScans ?? 0 },
  ];
  const currentDate = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const activityScans = recentScans.slice(0, 5);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="scene relative flex min-h-screen items-center justify-center overflow-hidden px-5 text-[#f2f4ef]">
        <style>{SCENE_CSS}</style>
        <GlassPanel className="relative w-full max-w-md bg-white/10 p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-300"><AlertTriangle size={24} /></div>
          <h2 className="mt-5 text-xl font-bold">Dashboard unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-[#9aa39a]">{error}</p>
          <button type="button" onClick={loadDashboard} className="premium-btn mt-6 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold">Try again <ArrowUpRight size={15} /></button>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="dashboard-shell relative min-h-screen overflow-hidden bg-[#090a07] text-[#f2f4ef] selection:bg-[#C0FF00]/30">
      <style>{`
        ${SCENE_CSS}
        @property --p { syntax: "<percentage>"; inherits: false; initial-value: 100%; }
        @keyframes donutIn { from { --p: 0%; } to { --p: 100%; } }
        @keyframes dashboardEnter { from { opacity:0; transform:translateY(14px); filter:blur(4px); } to { opacity:1; transform:translateY(0); filter:blur(0); } }
        @keyframes rowIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalFade { from { opacity:0; } to { opacity:1; } }
        @keyframes modalPop { from { opacity:0; transform:translateY(16px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }

        /* Buttons */
        .premium-btn { position:relative; isolation:isolate; overflow:hidden; border:1px solid #C0FF00 !important; background:rgba(192,255,0,.04) !important; color:#C0FF00 !important; transition:color .3s ease,transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s ease,border-color .3s ease; }
        .premium-btn::before { content:""; position:absolute; z-index:-1; inset:0; background:#C0FF00; transform:scaleY(0); transform-origin:bottom; transition:transform .38s cubic-bezier(.2,.8,.2,1); }
        .premium-btn:hover::before { transform:scaleY(1); }
        .premium-btn:hover { color:#0a0c06 !important; transform:translateY(-2px); box-shadow:0 10px 30px rgba(192,255,0,.22); }
        .premium-btn:active { transform:translateY(0) scale(.98); }
        .danger-btn { border:1px solid rgba(255,77,94,.65); background:rgba(239,68,68,.16); color:#ff6b7a; transition:background .25s ease,border-color .25s ease,transform .25s ease,box-shadow .25s ease; }
        .danger-btn:hover { background:rgba(239,68,68,.30); border-color:#ff4d5e; transform:translateY(-2px); box-shadow:0 9px 24px rgba(255,77,94,.25); }
        .neutral-btn { border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.06); color:#e4e9e0; transition:background .25s ease,transform .25s ease,border-color .25s ease; }
        .neutral-btn:hover { background:rgba(255,255,255,.12); border-color:rgba(192,255,0,.4); transform:translateY(-1px); }

        /* Layout: tighter max width so cards stay compact */
        .dash-main { padding-left:max(clamp(1rem,3vw,2rem),env(safe-area-inset-left,0px),calc((100% - 1320px) / 2 + 2.5rem)); padding-right:max(clamp(1rem,3vw,2rem),env(safe-area-inset-right,0px),calc((100% - 1320px) / 2 + 2.5rem)); }

        /* Page entrance (sections stagger) */
        .dashboard-shell main > section { animation:dashboardEnter .7s cubic-bezier(.16,1,.3,1) both; }
        .dashboard-shell main > section:nth-of-type(2) { animation-delay:.05s; }
        .dashboard-shell main > section:nth-of-type(3) { animation-delay:.1s; }
        .dashboard-shell main > section:nth-of-type(4) { animation-delay:.15s; }
        .dashboard-shell main > section:nth-of-type(5) { animation-delay:.2s; }

        /* Glass panels: quiet edge, lime only on hover */
        .glass-panel { background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.09) !important; box-shadow:0 18px 50px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.08); -webkit-backdrop-filter:blur(24px) saturate(140%); backdrop-filter:blur(24px) saturate(140%); transition:border-color .4s ease,box-shadow .4s ease,background .4s ease,transform .45s cubic-bezier(.2,.8,.2,1); }
        .glass-panel::before { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; background:linear-gradient(90deg,transparent,rgba(192,255,0,.55),transparent) 50% 0 / 55% 1px no-repeat,linear-gradient(125deg,rgba(255,255,255,.07),transparent 28%,transparent 75%,rgba(255,255,255,.02)); }
        .glass-panel::after { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0; transition:opacity .35s ease; background:radial-gradient(340px circle at var(--mx,50%) var(--my,0%),rgba(192,255,0,.10),transparent 65%); }
        .glass-panel > * { position:relative; z-index:1; }
        .glass-panel:hover { border-color:rgba(192,255,0,.38) !important; box-shadow:0 24px 64px rgba(0,0,0,.48),0 0 28px rgba(192,255,0,.10),inset 0 1px 0 rgba(255,255,255,.12); }
        .glass-panel:hover::after { opacity:1; }

        /* Stat cards */
        .glass-card { animation:dashboardEnter .75s cubic-bezier(.16,1,.3,1) both; animation-delay:calc(var(--i,0) * 70ms + 120ms); }
        .glass-card:hover { transform:translateY(-4px); }
        .stat-grid > .glass-card:first-child { background:linear-gradient(145deg,#d6ff4d,#C0FF00 55%,#a8e600); border-color:rgba(255,255,255,.35) !important; box-shadow:0 18px 50px rgba(192,255,0,.18),inset 0 1px 0 rgba(255,255,255,.5); }
        .stat-grid > .glass-card:first-child::after { background:radial-gradient(340px circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.35),transparent 65%); }
        .stat-grid > .glass-card:first-child * { color:#0a0c06 !important; }
        .stat-grid > .glass-card:first-child .stat-icon { background:rgba(10,12,6,.12) !important; border-color:transparent !important; }

        /* Donut sweep */
        .donut-ring { -webkit-mask:conic-gradient(#000 var(--p),transparent 0); mask:conic-gradient(#000 var(--p),transparent 0); animation:donutIn 1.3s cubic-bezier(.2,.8,.2,1) .25s both; filter:drop-shadow(0 0 12px rgba(192,255,0,.18)); }

        /* Table rows + timeline */
        .scan-row { animation:rowIn .6s ease both; }
        .scan-row td:first-child { box-shadow:inset 2px 0 0 transparent; transition:box-shadow .3s ease; }
        .scan-row:hover td:first-child { box-shadow:inset 2px 0 0 #C0FF00; }
        .tl-item { animation:dashboardEnter .6s cubic-bezier(.16,1,.3,1) both; }

        .danger-panel { background:linear-gradient(110deg,rgba(239,68,68,.26),rgba(255,255,255,.03)); border-color:rgba(255,77,94,.55) !important; box-shadow:0 18px 48px rgba(0,0,0,.35),0 0 28px rgba(255,77,94,.12),inset 0 1px 0 rgba(255,255,255,.06); }

        /* Modal */
        .modal-backdrop { animation:modalFade .25s ease both; }
        .modal-pop { animation:modalPop .4s cubic-bezier(.16,1,.3,1) both; }

        /* Touch devices: no sticky hover states */
        @media (hover: none) {
          .glass-card:hover { transform:none; }
          .glass-panel:hover { border-color:rgba(255,255,255,.09) !important; box-shadow:0 18px 50px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.08); }
          .stat-grid > .glass-card:first-child:hover { box-shadow:0 18px 50px rgba(192,255,0,.18),inset 0 1px 0 rgba(255,255,255,.5); }
          .glass-panel:hover::after { opacity:0; }
          .premium-btn:hover { color:#C0FF00 !important; transform:none; box-shadow:none; }
          .premium-btn:hover::before { transform:scaleY(0); }
          .danger-btn:hover, .neutral-btn:hover { transform:none; box-shadow:none; }
          .scan-row:hover td:first-child { box-shadow:inset 2px 0 0 transparent; }
        }
        /* Phones: drop the GPU-heavy effects (blur, masks, spotlight), keep simple fades */
        @media (max-width: 767px) {
          @keyframes dashboardEnter { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
          .glass-panel { -webkit-backdrop-filter:none; backdrop-filter:none; background:rgba(22,26,22,.78); box-shadow:0 8px 24px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.08); transition:none; }
          .glass-panel::after { display:none; }
          .dashboard-shell .dash-main { -webkit-backdrop-filter:none; backdrop-filter:none; padding-bottom:calc(2rem + env(safe-area-inset-bottom,0px)); }
          .donut-ring { -webkit-mask:none; mask:none; animation:none; filter:none; }
          .modal-backdrop, .modal-backdrop > div { -webkit-backdrop-filter:none !important; backdrop-filter:none !important; }
        }
        .dashboard-shell a, .dashboard-shell button { -webkit-tap-highlight-color:transparent; }

        @media (prefers-reduced-motion: reduce) {
          .premium-btn,.premium-btn::before,.glass-panel,.glass-card,.dashboard-shell main > section,
          .donut-ring,.scan-row,.tl-item,.modal-backdrop,.modal-pop { transition:none !important; animation:none !important; }
        }
      `}</style>

      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="scene absolute inset-0" />
        <div className="absolute -left-32 top-28 hidden h-[320px] w-[320px] rounded-full bg-[#C0FF00]/[0.07] blur-[90px] md:-left-40 md:block md:h-[560px] md:w-[560px] md:blur-[150px]" />
        <div className="absolute -right-28 -top-24 hidden h-[320px] w-[320px] rounded-full bg-[#c8a77a]/[0.08] blur-[90px] md:-right-36 md:-top-32 md:block md:h-[580px] md:w-[580px] md:blur-[160px]" />
        <div className="absolute bottom-[-160px] left-[20%] hidden h-[320px] w-[320px] rounded-full bg-[#C0FF00]/[0.04] blur-[90px] md:bottom-[-260px] md:left-[34%] md:block md:h-[560px] md:w-[560px] md:blur-[160px]" />
        <div className="absolute inset-0 bg-black/[0.03]" />
      </div>

      <div className="relative min-h-screen w-full">
        <main className="dash-main min-h-screen min-w-0 bg-black/10 py-4 pb-8 backdrop-blur-[30px] sm:py-6">
          {/* Hidden on phones; `md:contents` keeps desktop layout and sticky behaviour unchanged */}
          <div className="hidden md:contents">
            <DashboardNavbar user={user} initials={initials} />
          </div>

          {/* Welcome */}
          <section id="overview" className="mb-6 flex flex-col justify-between gap-4 px-1 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#C0FF00]">Your security workspace</p>
              <h1 className="text-[26px] font-bold leading-tight tracking-[-0.06em] text-[#f2f4ef] sm:text-[34px]">{getGreeting()}, {firstName}<span className="ml-2 text-[#C0FF00]">✦</span></h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#b4bcb2]">A clear view of your repositories, recent scans and security findings.</p>
              <p className="mt-2.5 flex items-center gap-2 text-[11px] font-medium text-[#9aa39a]"><CalendarDays size={13} />{currentDate}</p>
            </div>
            <Link to="/workspace" className="neutral-btn group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-[12px] font-bold backdrop-blur-xl sm:h-10 sm:w-fit"><ScanSearch size={14} />Open scanning workspace<ArrowUpRight size={13} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
          </section>

          {/* Metrics */}
          <section className="stat-grid mb-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {stats.map((stat, index) => <StatCard key={stat.key} index={index} title={stat.title} value={stat.value} description={stat.description} icon={stat.icon} />)}
          </section>

          {/* Security analytics: side by side from lg */}
          <section className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.85fr)]">
            <GlassPanel className="p-5">
              <SectionHeading title="Security overview" description="A breakdown of findings by severity across your scans." action={<span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold text-[#9aa39a] sm:flex"><ShieldAlert size={12} className="text-slate-300" />Risk distribution</span>} />
              <div className="mt-5 grid items-center gap-6 sm:grid-cols-[170px_1fr]">
                <SeverityDonut security={security} total={totalFindings} />
                <div className="space-y-4">
                  {severityItems.map((item, index) => {
                    const value = security[item.key];
                    const percentage = totalFindings > 0 ? (value / totalFindings) * 100 : 0;
                    return (
                      <div key={item.key}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-2.5 text-[12px] font-medium text-[#b4bcb2]"><span className={`h-2 w-2 rounded-full ${item.dot}`} />{item.label}</span>
                          <span className="text-[12px] font-bold text-[#f2f4ef]">{value.toLocaleString("en-IN")}<span className="ml-2 font-medium text-[#9aa39a]">{percentage.toFixed(0)}%</span></span>
                        </div>
                        <GrowBar pct={percentage} className={item.bar} delay={300 + index * 100} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5"><span className="text-[11px] text-[#9aa39a]">Total classified findings</span><span className="text-[13px] font-bold text-[#f2f4ef]">{totalFindings.toLocaleString("en-IN")}</span></div>
            </GlassPanel>
            <ScanStatusCard scans={recentScans} />
          </section>

          {/* Recent scans and activity */}
          <section id="recent-scans" className="mb-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.85fr)]">
            <GlassPanel>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <SectionHeading title="Recent scans" description="The latest repository security checks." />
                <Link to="/workspace" className="neutral-btn inline-flex h-9 items-center gap-2 rounded-full px-3 text-[11px] font-bold">View workspace<ArrowUpRight size={12} /></Link>
              </div>
              {recentScans.length === 0 ? <EmptyScans onScan={() => navigate("/workspace")} /> : (
                <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[480px] text-left">
                    <thead><tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa39a]"><th className="px-5 py-3">Repository</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Findings</th><th className="px-5 py-3 text-right"> </th></tr></thead>
                    <tbody>
                      {recentScans.slice(0, 6).map((scan, index) => {
                        const status = statusStyles[String(scan.status || "PENDING").toUpperCase()] || statusStyles.PENDING;
                        return (
                          <tr key={scan.id} style={{ animationDelay: `${300 + index * 70}ms` }} className="scan-row group/row border-b border-white/[0.06] transition last:border-0 hover:bg-white/[0.05]">
                            <td className="px-5 py-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#C0FF00]"><GitBranch size={15} /></span><span className="min-w-0"><span className="block max-w-[230px] truncate text-[12px] font-bold text-[#f2f4ef]">{scan.repository?.name || scan.repository?.fullName || "Unknown repository"}</span><span className="mt-0.5 block text-[10px] text-[#9aa39a]">{formatRelativeDate(scan.createdAt)}</span></span></div></td>
                            <td className="px-4 py-3"><span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${status.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span></td>
                            <td className="px-4 py-3 text-[12px] font-bold text-[#d9dfd5]">{safeNumber(scan.totalIssues)}</td>
                            <td className="px-5 py-3 text-right"><Link to={`/workspace?scanId=${scan.id}`} title="View scan" className="inline-grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/10 text-slate-300 transition duration-300 hover:translate-x-0.5 hover:border-[#C0FF00]/50 hover:bg-[#C0FF00] hover:text-[#0a0c06]"><ChevronRight size={15} /></Link></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <ul className="divide-y divide-white/[0.06] md:hidden">
                  {recentScans.slice(0, 6).map((scan, index) => {
                    const status = statusStyles[String(scan.status || "PENDING").toUpperCase()] || statusStyles.PENDING;
                    const issues = safeNumber(scan.totalIssues);
                    return (
                      <li key={scan.id} style={{ animationDelay: `${300 + index * 70}ms` }} className="scan-row flex items-center gap-3 px-4 py-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#C0FF00]"><GitBranch size={16} /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-[#f2f4ef]">{scan.repository?.name || scan.repository?.fullName || "Unknown repository"}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-[#9aa39a]">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-bold ${status.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span>
                            <span>{issues} finding{issues === 1 ? "" : "s"}</span>
                            <span>{formatRelativeDate(scan.createdAt)}</span>
                          </div>
                        </div>
                        <Link to={`/workspace?scanId=${scan.id}`} aria-label="View scan" className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-slate-300 transition active:scale-95"><ChevronRight size={16} /></Link>
                      </li>
                    );
                  })}
                </ul>
                </>
              )}
            </GlassPanel>

            <GlassPanel id="activity" className="p-5">
              <SectionHeading title="Recent activity" description="A timeline of your latest scan activity." />
              {activityScans.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/[0.05] px-4 py-8 text-center"><Activity size={19} className="mx-auto text-[#9aa39a]" /><p className="mt-3 text-[12px] text-[#9aa39a]">Activity will appear after your first scan.</p></div>
              ) : (
                <div className="mt-6">
                  {activityScans.map((scan, index) => {
                    const status = statusStyles[String(scan.status || "PENDING").toUpperCase()] || statusStyles.PENDING;
                    const repository = scan.repository?.name || scan.repository?.fullName || "Repository scan";
                    return (
                      <div key={scan.id} style={{ animationDelay: `${300 + index * 90}ms` }} className="tl-item relative flex gap-3 pb-5 last:pb-0">
                        {index !== activityScans.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-gradient-to-b from-white/25 to-white/5" />}
                        <span className={`relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-[3px] border-[#0f1412] ${status.dot}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] leading-5 text-[#d9dfd5]"><span className="font-bold">{repository}</span><span className="text-[#9aa39a]"> scan </span><span className={`font-semibold ${status.badge.split(" ").at(-1)}`}>{status.label.toLowerCase()}</span></p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#9aa39a]"><span className="flex items-center gap-1.5"><Clock3 size={11} />{formatRelativeDate(scan.createdAt)}</span><span>{safeNumber(scan.totalIssues)} finding{safeNumber(scan.totalIssues) === 1 ? "" : "s"}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link to="/workspace" className="group mt-5 flex h-10 items-center justify-between border-t border-white/10 pt-3.5 text-[11px] font-bold text-[#C0FF00] transition hover:text-[#e2ff7a]">Go to all scans<ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
            </GlassPanel>
          </section>

          {/* Account controls */}
          <section id="account" className="danger-panel mb-5 rounded-[18px] border px-5 py-3.5 backdrop-blur-[30px]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#ff4d5e]/60 bg-[#ff4d5e]/20 text-[#ff4d5e]"><Trash2 size={16} /></span><div><h3 className="text-[12px] font-bold text-[#ff5a6a]">Account controls</h3><p className="mt-1 max-w-xl text-[11px] leading-5 text-[#9aa39a]">Permanently delete your account and associated data. This action cannot be undone.</p></div></div>
              <button type="button" onClick={() => { setDeleteError(""); setShowDeleteModal(true); }} className="danger-btn inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full px-3.5 text-[11px] font-bold sm:h-9 sm:w-auto"><Trash2 size={13} />Delete account</button>
            </div>
          </section>

          <footer className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-1 pt-4 text-center text-[10px] font-medium text-[#b4bcb2] sm:flex-row sm:text-left">
            <div className="flex items-center gap-2"><ShieldCheck size={13} className="text-[#C0FF00]" />ShipSafe · Security Intelligence</div>
            <span>Built for developers who care about security.</span>
          </footer>
        </main>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteModal && (
        <div className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) { setShowDeleteModal(false); setDeleteError(""); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="modal-pop max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[26px] border border-white/15 bg-[#101513]/95 p-5 sm:p-6 text-[#f2f4ef] shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
            <div className="mb-5 flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-300"><Trash2 size={20} /></div><button type="button" disabled={deleting} onClick={() => { setShowDeleteModal(false); setDeleteError(""); }} aria-label="Close dialog" className="grid h-8 w-8 place-items-center rounded-full text-[#9aa39a] transition hover:rotate-90 hover:bg-white/10 hover:text-[#f2f4ef] disabled:opacity-50"><X size={16} /></button></div>
            <h3 id="delete-account-title" className="text-lg font-bold tracking-tight">Delete your account?</h3>
            <p className="mt-3 text-[12px] leading-6 text-[#9aa39a]">This will permanently delete your ShipSafe account and associated data. You won't be able to recover your account after this action.</p>
            {deleteError && <div className="mt-5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-[11px] leading-5 text-rose-300">{deleteError}</div>}
            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={deleting} onClick={() => { setShowDeleteModal(false); setDeleteError(""); }} className="neutral-btn h-10 rounded-full px-4 text-[11px] font-bold disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deleting} onClick={handleDeleteAccount} className="danger-btn flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[11px] font-bold disabled:opacity-60">{deleting ? <><Loader2 size={13} className="animate-spin" />Deleting...</> : <><Trash2 size={13} />Delete permanently</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;