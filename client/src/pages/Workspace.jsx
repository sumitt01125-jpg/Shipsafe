import { useState, useEffect, useRef, useCallback } from "react";

import { useSearchParams } from "react-router-dom";

import "./workspace-motion.css";

import { WorkspaceNavbar } from "../components/layout/Navbar.jsx";

import {

  Terminal,

  Network,

  ShieldAlert,

  Sparkles,

  PanelLeft,

} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

import ChatSidebar from "../components/chat/ChatSidebar";

import ChatInput from "../components/chat/ChatInput";

import ThinkingIndicator from "../components/chat/ThinkingIndicator";

import ScanResults from "../components/workspace/ScanResults";

import ArchitectureGraph from "../components/workspace/ArchitectureGraph";

import { addRepository } from "../services/repository.service.js";

import {

  startScan,

  getScanById,

} from "../services/scan.service.js";

import {

  createChatSession,

  getChatSession,

  saveChatMessage,

} from "../services/chat.service.js";

function TypewriterGreeting({ name }) {

  const fullText = `Hey, ${name}`;

  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {

    let index = 0;

    setVisibleText("");

    const timer = window.setInterval(() => {

      index += 1;

      setVisibleText(fullText.slice(0, index));

      if (index >= fullText.length) window.clearInterval(timer);

    }, 85);

    return () => window.clearInterval(timer);

  }, [fullText]);

  return <>{visibleText}<span className="shipsafe-type-caret" aria-hidden="true" /></>;

}

function AnimatedMessage({ content }) {

  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {

    const words = content.split(" ");

    let index = 0;

    setVisibleText("");

    const interval = setInterval(() => {

      index++;

      setVisibleText(words.slice(0, index).join(" "));

      if (index >= words.length) {

        clearInterval(interval);

      }

    }, 25);

    return () => clearInterval(interval);

  }, [content]);

  return <span className="whitespace-pre-wrap">{visibleText}</span>;

}

function Workspace() {

  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);

  const [activeScan, setActiveScan] = useState(null);

  const [thinking, setThinking] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [activeView, setActiveView] = useState("canvas");

  const [chatSessionId, setChatSessionId] = useState(null);

  const [activeSessionId, setActiveSessionId] = useState(null);

  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [hasDraft, setHasDraft] = useState(false);

  const messagesEndRef = useRef(null);

  const resultsRef = useRef(null);

  const firstName =

    user?.name?.split(" ")[0] ||

    user?.fullName?.split(" ")[0] ||

    user?.email?.split("@")[0] ||

    "there";

  // Scroll to latest message*

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({

      behavior: "smooth",

    });

  }, [messages, thinking]);

  // Get or create a chat session*

  const ensureChatSession = async () => {

    if (chatSessionId) {

      return chatSessionId;

    }

    const response = await createChatSession();

    const session =

      response.session ||

      response.data?.session;

    if (!session?.id) {

      throw new Error("Chat session could not be created.");

    }

    setChatSessionId(session.id);

    setActiveSessionId(session.id);

    setHistoryRefreshKey((prev) => prev + 1);

    return session.id;

  };

  // Save assistant message*

  const addAssistantMessage = async (content, sessionId, scanId) => {

    setMessages((prev) => [

      ...prev,

      {

        role: "assistant",

        content,

      },

    ]);

    if (sessionId) {

      try {

        await saveChatMessage(

          sessionId,

          "ASSISTANT",

          content,

          scanId

        );

      } catch (error) {

        console.error("Assistant message could not be saved:", error);

      }

    }

  };

  // New chat*

  const handleNewChat = () => {

    setMessages([]);

    setActiveScan(null);

    setThinking(false);

    setActiveView("canvas");

    setChatSessionId(null);

    setActiveSessionId(null);

    setSearchParams({});

  };

  // Restore existing chat session*

  const handleSelectSession = async (sessionId) => {

    if (thinking) return;

    try {

      setThinking(true);

      const response = await getChatSession(sessionId);

      const session =

        response.session ||

        response.data?.session;

      if (!session) {

        throw new Error("Chat session not found.");

      }

      const restoredMessages = (session.messages || []).map((message) => ({

        role: message.role.toLowerCase(),

        content: message.content,

      }));

      setMessages(restoredMessages);

      setChatSessionId(session.id);

      setActiveSessionId(session.id);

      setActiveScan(null);

      setActiveView("canvas");

      // Restore the latest scan linked to this session.*

      const latestScan = session.scans?.[0];

      if (latestScan?.id) {

        const scanResponse = await getScanById(latestScan.id);

        const scan =

          scanResponse.scan ||

          scanResponse.data?.scan;

        if (scan) {

          setActiveScan(scan);

        }

      }

      setSearchParams({});

    } catch (error) {

      console.error("Chat restoration failed:", error);

    } finally {

      setThinking(false);

    }

  };

  // Restore a specific scan from Dashboard*

  const restoreDashboardScan = useCallback(async (scanId) => {

    try {

      setThinking(true);

      const response = await getScanById(scanId);

      const scan =

        response.scan ||

        response.data?.scan;

      if (!scan) {

        throw new Error("Scan report could not be loaded.");

      }

      setActiveScan(scan);

      setActiveView("canvas");

      setMessages([

        {

          role: "assistant",

          content: `Previous analysis restored for ${scan.repository?.fullName || "your repository"}.`,

        },

      ]);

      setChatSessionId(scan.chatSessionId || null);

      setActiveSessionId(scan.chatSessionId || null);

    } catch (error) {

      console.error("Scan restoration failed:", error);

      setMessages([

        {

          role: "assistant",

          content: `Unable to restore this report: ${error.message}`,

        },

      ]);

    } finally {

      setThinking(false);

      setSearchParams({});

    }

  }, [setSearchParams]);

  // Dashboard scan restoration*

  useEffect(() => {

    const scanId = searchParams.get("scanId");

    if (scanId) {

      restoreDashboardScan(scanId);

    }

  }, [searchParams, restoreDashboardScan]);

  // Send message and analyze repository*

  const handleSend = async (message) => {

    const userMessage = message.trim();

    if (!userMessage || thinking) return;

    setMessages((prev) => [

      ...prev,

      {

        role: "user",

        content: userMessage,

      },

    ]);

    setThinking(true);

    setActiveScan(null);

    let sessionId = chatSessionId;

    try {

      sessionId = await ensureChatSession();

      // Save user message*

      await saveChatMessage(

        sessionId,

        "USER",

        userMessage

      );

      const githubUrl = userMessage.match(

        /https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?/i

      )?.[0];

      if (!githubUrl) {

        await addAssistantMessage(

          "I'm ShipSafe, your repository security analyzer. Please submit a valid public GitHub repository URL to begin analysis.",

          sessionId

        );

        return;

      }

      await addAssistantMessage(

        "Connecting to your GitHub repository...",

        sessionId

      );

      const repositoryResponse = await addRepository(githubUrl);

      const repository =

        repositoryResponse.repository ||

        repositoryResponse.data?.repository;

      if (!repository?.id) {

        throw new Error("Repository could not be registered.");

      }

      await addAssistantMessage(

        `Repository connected successfully: ${repository.fullName}. Starting security analysis...`,

        sessionId

      );

      const scanResponse = await startScan(

        repository.id,

        sessionId

      );

      const scan =

        scanResponse.scan ||

        scanResponse.data?.scan;

      if (!scan) {

        throw new Error("Scan response was invalid.");

      }

      setActiveScan(scan);

      setActiveView("canvas");

      await addAssistantMessage(

        "Repository analysis completed successfully.",

        sessionId,

        scan.id

      );

      setHistoryRefreshKey((prev) => prev + 1);

      setTimeout(() => {

        resultsRef.current?.scrollIntoView({

          behavior: "smooth",

          block: "start",

        });

      }, 300);

    } catch (error) {

      await addAssistantMessage(

        `Analysis failed: ${error.message}`,

        sessionId

      );

    } finally {

      setThinking(false);

    }

  };

  return (

    <div className="h-screen flex overflow-hidden bg-[#080b0a] text-white">

      <style>{`

        @import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap");

        .ship-display { font-family: "Geist", system-ui, sans-serif; }

        @keyframes shipDotGlow { 0%,100% { box-shadow: 0 0 6px 1px rgba(57,255,20,.75); } 50% { box-shadow: 0 0 14px 4px rgba(57,255,20,1); } }

        .ship-dot-glow { animation: shipDotGlow 1.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) { .ship-dot-glow { animation: none; box-shadow: 0 0 10px 2px rgba(57,255,20,.9); } }

        .workspace-mobile-topbar { display: none; }
        @media (max-width: 767px) {
          .workspace-desktop-navbar { display: none !important; }
          .workspace-mobile-topbar { display: flex; }
        }
        @media (max-width: 640px) {
          .ship-workspace-greeting { top: 22%; width: calc(100% - 32px); white-space: normal; }
          .ship-workspace-greeting h1 { font-size: clamp(2rem, 9vw, 2.75rem); line-height: 1.15; overflow-wrap: anywhere; }
          .ship-workspace-content { padding-left: 1rem; padding-right: 1rem; }
          .ship-workspace-message { max-width: 92%; padding: 0.8rem 0.9rem; overflow-wrap: anywhere; }
          .ship-workspace-input { width: 100%; padding-left: 0.75rem; padding-right: 0.75rem; }
          .ship-workspace-input > p { padding: 0 0.5rem; line-height: 1.5; }
          .ship-workspace-tabs { overflow-x: auto; scrollbar-width: none; }
          .ship-workspace-tabs::-webkit-scrollbar { display: none; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .ship-workspace-content { padding-left: 1.5rem; padding-right: 1.5rem; }
          .ship-workspace-greeting { width: calc(100% - 64px); white-space: normal; }
        }

      `}</style>

      <ChatSidebar

        onNewChat={handleNewChat}

        onSelectSession={handleSelectSession}

        activeSessionId={activeSessionId}

        refreshKey={historyRefreshKey}

        collapsed={sidebarCollapsed}

        setCollapsed={setSidebarCollapsed}

      />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">

        <div className="workspace-desktop-navbar">
          <WorkspaceNavbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} thinking={thinking} />
        </div>
        <div className="workspace-mobile-topbar fixed inset-x-0 top-0 z-40 h-14 items-center justify-between border-b border-white/[0.08] bg-[#090d0a]/85 px-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Open sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-[#C0FF00]/40 hover:text-[#C0FF00]"
          >
            <PanelLeft size={18} />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-[#C0FF00]/20 bg-[#C0FF00]/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C0FF00] shadow-[0_0_8px_#C0FF00]" />
            <span className="text-[10px] font-semibold tracking-wide text-[#C0FF00]">Scanner Ready</span>
          </div>
        </div>

        <section className="relative min-h-0 flex-1 overflow-hidden">

          <div className={`absolute inset-0 ${messages.length ? "overflow-y-auto pb-44" : "overflow-hidden"}`}>

            <div className={`ship-workspace-content relative mx-auto w-full max-w-5xl px-5 md:px-8 ${messages.length ? "pb-12 pt-8" : "h-full"}`}>

              {messages.length === 0 ? (

                <div className="ship-workspace-greeting fixed left-1/2 top-[calc(60px+22vh)] z-[5] flex -translate-x-1/2 items-center justify-center whitespace-nowrap text-center">

                  <h1 className="ship-display text-4xl font-medium tracking-[-0.035em] text-slate-100 md:text-[56px]">

                    <TypewriterGreeting name={firstName} />

                  </h1>

                </div>

              ) : (

                <>

                  <div className="space-y-6">

                    {messages.map((message, index) => (

                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>

                        {message.role === "assistant" && (

                          <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#C0FF00]/35 bg-[#C0FF00]/[0.08] text-[#C0FF00]">

                            <Terminal size={15} />

                          </div>

                        )}

                        <div className={`ship-workspace-message max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-7 ${message.role === "user" ? "border border-[#C0FF00]/35 bg-[#151d15] text-slate-100" : "border border-white/[0.07] bg-[#101512] text-slate-300"}`}>

                          {message.role === "assistant" ? <AnimatedMessage content={message.content} /> : message.content}

                        </div>

                      </div>

                    ))}

                    {thinking && <ThinkingIndicator />}

                    <div ref={messagesEndRef} />

                  </div>

                  {activeScan && (

                    <div ref={resultsRef} className="mt-12 border-t border-white/[0.08] pt-8">

                      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

                        <div>

                          <h2 className="text-xl font-semibold text-white">Analysis Results</h2>

                          <p className="mt-1 text-xs text-gray-500">{activeScan.repository?.fullName}</p>

                        </div>

                        <span className="rounded-full border border-[#C0FF00]/35 bg-[#C0FF00]/[0.10] px-3 py-2 text-xs text-[#C0FF00]">Analysis Completed</span>

                      </div>

                      <div className="ship-workspace-tabs mb-6 flex items-center gap-2 border-b border-white/[0.08]">

                        <button onClick={() => setActiveView("canvas")} className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm transition ${activeView === "canvas" ? "border-[#C0FF00] text-[#C0FF00]" : "border-transparent text-gray-500 hover:text-white"}`}>

                          <Network size={17} /> Canvas

                        </button>

                        <button onClick={() => setActiveView("findings")} className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm transition ${activeView === "findings" ? "border-[#C0FF00] text-[#C0FF00]" : "border-transparent text-gray-500 hover:text-white"}`}>

                          <ShieldAlert size={17} /> Findings

                          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px]">{activeScan.findings?.length || 0}</span>

                        </button>

                      </div>

                      {activeView === "canvas" && (activeScan.architectureGraph ? <ArchitectureGraph graph={activeScan.architectureGraph} /> : (

                        <div className="rounded-xl border border-white/[0.07] bg-[#101612] p-8 text-center">

                          <Network size={30} className="mx-auto mb-3 text-gray-500" />

                          <p className="text-sm text-gray-400">Architecture graph is unavailable for this scan.</p>

                        </div>

                      ))}

                      {activeView === "findings" && <ScanResults scan={activeScan} />}

                    </div>

                  )}

                </>

              )}

            </div>

          </div>

          <div className={`ship-workspace-input absolute left-1/2 z-10 w-full max-w-4xl -translate-x-1/2 px-5 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] md:px-8 ${messages.length || hasDraft ? "bottom-0 translate-y-0 pb-4" : "top-[61%] -translate-y-1/2 pb-0"}`}>

            <ChatInput onSend={handleSend} disabled={thinking} onDraftChange={setHasDraft} />

            <p className="mt-3 text-center text-[10px] tracking-wide text-slate-600">

              ShipSafe analyzes repository evidence. Never share secrets or production credentials.

            </p>

          </div>

        </section>

      </main>

    </div>

  );

}

export default Workspace;
