import { useEffect, useRef, useState } from "react";

import {

  Plus, MessageSquare, LayoutDashboard, LogOut, UserRound,

  LoaderCircle, MoreVertical, Trash2, PanelLeft,

} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

import { getChatSessions, deleteChatSession } from "../../services/chat.service.js";

function getSessionTitle(session) {

  const repositoryName = session.scans?.[0]?.repository?.name;

  if (repositoryName) return repositoryName;

  const title = session.title || "New Analysis";

  try {

    const url = new URL(title);

    if (url.hostname === "github.com") {

      const parts = url.pathname.split("/").filter(Boolean);

      const name = parts[1]?.replace(/\.git$/i, "");

      if (name) return name;

    }

  } catch {

    // Keep the original title when it is not a URL.

  }

  return title.length > 28 ? `${title.slice(0, 28)}...` : title;

}

function ChatSidebar({

  onNewChat, onSelectSession, activeSessionId, collapsed,

  setCollapsed, refreshKey = 0,

}) {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);

  const [loadingHistory, setLoadingHistory] = useState(true);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const menuRef = useRef(null);

  useEffect(() => {

    let isMounted = true;

    const loadSessions = async () => {

      try {

        setLoadingHistory(true);

        const response = await getChatSessions();

        if (isMounted) setSessions(response.sessions || response.data?.sessions || []);

      } catch (error) {

        console.error("Failed to load chat history:", error);

      } finally {

        if (isMounted) setLoadingHistory(false);

      }

    };

    loadSessions();

    return () => { isMounted = false; };

  }, [refreshKey]);

  useEffect(() => {

    const handleOutsideClick = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);

    };

    const handleEscape = (event) => { if (event.key === "Escape") setOpenMenuId(null); };

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {

      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);

    };

  }, []);

  useEffect(() => { if (collapsed) setOpenMenuId(null); }, [collapsed]);

  const handleDeleteChat = async (sessionId) => {

    const confirmed = window.confirm("Are you sure you want to delete this chat? This action cannot be undone.");

    if (!confirmed) { setOpenMenuId(null); return; }

    try {

      setDeletingId(sessionId);

      setOpenMenuId(null);

      await deleteChatSession(sessionId);

      setSessions((previous) => previous.filter((session) => session.id !== sessionId));

      if (activeSessionId === sessionId) onNewChat?.();

    } catch (error) {

      console.error("Failed to delete chat:", error);

      window.alert(error.message || "Unable to delete chat.");

    } finally {

      setDeletingId(null);

    }

  };

  const handleLogout = async () => {

    try { await logout(); navigate("/login", { replace: true }); }

    catch (error) { console.error("Logout failed:", error); }

  };

  const displayName = user?.name || user?.fullName || "User";

  const initials = displayName.split(" ").filter(Boolean).slice(0, 2)

    .map((part) => part[0].toUpperCase()).join("");

  return (

    <aside
      data-collapsed={collapsed}
      className={`shipsafe-chat-sidebar relative z-30 flex h-screen shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#090b0a]/95 text-slate-200 shadow-[18px_0_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition-[width] duration-300 ${collapsed ? "w-0 border-r-0" : "w-[264px]"}`}
    >
      <style>{`
        @media (max-width: 767px) {
          .shipsafe-chat-sidebar:not([data-collapsed="true"]) {
            position: fixed;
            inset: 0 auto 0 0;
            z-index: 50;
            width: min(84vw, 300px);
            height: 100dvh;
            max-height: 100dvh;
          }
          .shipsafe-chat-sidebar[data-collapsed="true"] {
            position: fixed;
            inset: 0 auto 0 0;
            z-index: 50;
            width: 0;
            height: 100dvh;
          }
          .shipsafe-chat-sidebar > div:last-child {
            padding-bottom: max(0.625rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>

      {!collapsed && <>

        <div className="border-b border-white/[0.07] p-3">

          <div className="group flex items-center gap-2.5 rounded-xl border border-white/[0.09] bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 hover:border-[#C0FF00]/25 hover:bg-white/[0.06]">

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#C0FF00]/25 bg-[#C0FF00]/[0.10] text-sm font-bold text-[#C0FF00] shadow-[0_0_22px_rgba(192,255,0,0.07)]">

              {initials || <UserRound size={17} />}

            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-[13px] font-semibold tracking-tight text-white">{displayName}</p>

              <p className="mt-1 text-[9px] font-semibold tracking-[0.19em] text-slate-500">SHIPSAFE ACCOUNT</p>

            </div>

            <button type="button" onClick={() => setCollapsed(true)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[0.09] bg-white/[0.035] text-slate-400 transition duration-200 hover:border-[#C0FF00]/35 hover:bg-[#C0FF00]/[0.09] hover:text-[#C0FF00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0FF00]/60" title="Collapse sidebar" aria-label="Collapse sidebar">

              <PanelLeft size={17} strokeWidth={1.8} />

            </button>

          </div>

        </div>

        <div className="px-3.5 pb-4 pt-3">

          <button type="button" onClick={() => { setOpenMenuId(null); onNewChat?.(); }} className="group relative flex h-10 w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-[#C0FF00] bg-[#C0FF00] px-3.5 text-[12px] font-bold text-[#10130a] shadow-[0_5px_22px_rgba(192,255,0,0.10)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_9px_28px_rgba(192,255,0,0.20)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0FF00]/60">

            <span className="absolute inset-0 origin-bottom scale-y-0 bg-white/35 transition-transform duration-300 ease-out group-hover:scale-y-100" />

            <Plus size={16} strokeWidth={2.3} className="relative" />

            <span className="relative">New Analysis</span>

          </button>

        </div>

        <div className="mt-0.5 min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">

          <div className="mb-2.5 flex items-center justify-between px-3">

            <p className="text-[9px] font-bold tracking-[0.19em] text-slate-500">RECENT ANALYSES</p>

            <span className="h-px w-8 bg-gradient-to-r from-white/15 to-transparent" />

          </div>

          {loadingHistory ? (

            <div className="space-y-3 px-3 py-2" role="status" aria-label="Loading chat history">

              {[1, 2, 3, 4, 5].map((item) => (

                <div key={item} className="flex animate-pulse items-center gap-3 py-2">

                  <div className="h-4 w-4 rounded-md bg-white/10" />

                  <div className="flex-1 space-y-2">

                    <div className="h-2.5 rounded-full bg-white/10" style={{ width: `${65 + (item % 3) * 10}%` }} />

                    <div className="h-2 w-1/2 rounded-full bg-white/[0.06]" />

                  </div>

                </div>

              ))}

            </div>

          ) : sessions.length === 0 ? (

            <div className="mx-1 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] px-3 py-5 text-center">

              <MessageSquare size={17} className="mx-auto text-slate-600" />

              <p className="mt-2 text-[11px] leading-5 text-slate-500">Your analyses will appear here.</p>

            </div>

          ) : (

            <div className="space-y-1" ref={menuRef}>

              {sessions.map((session) => {

                const isActive = activeSessionId === session.id;

                const isDeleting = deletingId === session.id;

                return (

                  <div key={session.id} className={`group relative flex items-center rounded-xl border transition-all duration-200 ${isActive ? "border-[#C0FF00]/20 bg-[#C0FF00]/[0.09] shadow-[inset_0_1px_0_rgba(192,255,0,0.06)]" : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.045]"}`}>

                    {isActive && <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-[#C0FF00] shadow-[0_0_10px_rgba(192,255,0,0.55)]" />}

                    <button type="button" onClick={() => { setOpenMenuId(null); onSelectSession?.(session.id); }} className={`flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left text-[11px] transition-colors ${isActive ? "font-semibold text-[#C0FF00]" : "text-slate-400 hover:text-slate-100"}`} title={getSessionTitle(session)}>

                      <MessageSquare size={15} strokeWidth={1.8} className={`shrink-0 ${isActive ? "text-[#C0FF00]" : "text-slate-500"}`} />

                      <span className="truncate">{getSessionTitle(session)}</span>

                    </button>

                    <div className="relative shrink-0 pr-2">

                      <button type="button" onClick={(event) => { event.stopPropagation(); setOpenMenuId((current) => current === session.id ? null : session.id); }} disabled={isDeleting} className={`rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-[#C0FF00] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C0FF00]/60 ${openMenuId === session.id ? "bg-white/[0.08] text-[#C0FF00] opacity-100" : "opacity-0 group-hover:opacity-100"}`} title="More options" aria-label={`More options for ${getSessionTitle(session)}`}>

                        {isDeleting ? <LoaderCircle size={15} className="animate-spin" /> : <MoreVertical size={15} />}

                      </button>

                      {openMenuId === session.id && (

                        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-white/[0.10] bg-[#151a16]/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">

                          <button type="button" onClick={() => handleDeleteChat(session.id)} disabled={isDeleting} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-rose-400 transition hover:bg-rose-400/10 hover:text-rose-300">

                            <Trash2 size={14} /> Delete chat

                          </button>

                        </div>

                      )}

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

        <div className="space-y-1 border-t border-white/[0.07] bg-black/10 p-2.5">

          <Link to="/dashboard" className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-[11px] font-medium text-slate-400 transition duration-200 hover:border-white/[0.07] hover:bg-white/[0.045] hover:text-[#C0FF00]">

            <LayoutDashboard size={16} className="text-slate-500 transition-colors group-hover:text-[#C0FF00]" />

            Dashboard

          </Link>

          <button type="button" onClick={handleLogout} className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-[11px] font-medium text-slate-400 transition duration-200 hover:border-rose-400/10 hover:bg-rose-400/[0.06] hover:text-rose-300">

            <LogOut size={16} className="text-slate-500 transition-colors group-hover:text-rose-300" />

            Logout

          </button>

        </div>

      </>}

    </aside>

  );

}

export default ChatSidebar;
