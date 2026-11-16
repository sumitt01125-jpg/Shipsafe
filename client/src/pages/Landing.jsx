import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import Navbar, { BrandMark } from "../components/layout/Navbar";

import gsap from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import Footer from "../components/layout/Footer";

import {

  ArrowRight, ArrowUpRight, Code2, Database, FileCode2, FolderGit2,

  GitBranch, LockKeyhole, Menu, ScanSearch, Server, ShieldAlert,

  Terminal, X,

} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [

  { title: "See how it’s built", copy: "Entry points, services, data stores and the links between them, mapped straight from your code." },

  { title: "Find what’s risky", copy: "Every issue points back to the file it came from, so you can check it yourself in seconds." },

  { title: "Know what to fix first", copy: "A short, ordered review of what’s fine, what needs work and why." },

];

const workspaceItems = [

  ["Repositories", "See which projects are connected and which ones have been analyzed."],

  ["Scan history", "Recent scans and their status, without digging through old runs."],

  ["Findings", "Where a closer look is worth your time, and where it isn’t."],

];

const steps = [

  ["Connect a repository", "Paste the URL of a public GitHub repository and start the scan."],

  ["Read the evidence", "Go through the mapped structure and each finding, with the file it came from."],

  ["Decide what happens next", "Pick your fixes, ask follow-up questions and make the call on releasing."],

];

function ArchitecturePreview() {

  return (

    <div className="ss-window ss-architecture relative">

      <div className="ss-bar"><span>Repository map</span><span className="text-[#6f7a6c]">demo · node service</span></div>

      <div className="ss-arch-canvas">

        <svg className="ss-arch-lines" viewBox="0 0 760 430" preserveAspectRatio="none" aria-hidden="true">

          <defs><linearGradient id="ss-flow" x1="0" x2="1"><stop offset="0" stopColor="#c0ff00" stopOpacity=".05"/><stop offset=".5" stopColor="#c0ff00" stopOpacity=".8"/><stop offset="1" stopColor="#c0ff00" stopOpacity=".08"/></linearGradient></defs>

          <path className="ss-flow-line" d="M380 76 V126 H190 V178 M380 126 H570 V178 M190 258 V308 H380 V354 M570 258 V308 H380" />

          <path className="ss-flow-line ss-flow-line-delay" d="M190 258 V308 H380 V354 M570 258 V308 H380" />

          <circle className="ss-flow-particle" r="3.5"><animateMotion dur="4.2s" repeatCount="indefinite" path="M380 76 V126 H190 V178" /></circle>

          <circle className="ss-flow-particle" r="3.5"><animateMotion dur="4.8s" begin=".7s" repeatCount="indefinite" path="M380 76 V126 H570 V178" /></circle>

          <circle className="ss-flow-particle" r="3.5"><animateMotion dur="4.4s" begin="1.2s" repeatCount="indefinite" path="M190 258 V308 H380 V354" /></circle>

        </svg>

        <div className="ss-node ss-node-root"><GitBranch size={17}/><div><b>acme / storefront</b><small>GitHub repository</small></div><span className="ss-node-state">connected</span></div>

        <div className="ss-node-row">

          <div className="ss-node ss-node-good"><Code2 size={18}/><div><b>Web application</b><small>src/app · routes</small></div><span className="ss-node-state">found</span></div>

          <div className="ss-node ss-node-good"><Server size={18}/><div><b>API service</b><small>src/server · routes</small></div><span className="ss-node-state">found</span></div>

        </div>

        <div className="ss-node-row ss-node-row-bottom">

          <div className="ss-node ss-node-muted"><LockKeyhole size={17}/><div><b>Auth layer</b><small>middleware / session</small></div></div>

          <div className="ss-node ss-node-review"><Database size={17}/><div><b>Data layer</b><small>schema / migrations</small></div><span className="ss-review-dot"/></div>

          <div className="ss-node ss-node-muted"><FileCode2 size={17}/><div><b>Configuration</b><small>env / runtime</small></div></div>

        </div>

        <div className="ss-arch-legend"><span><i className="legend-good"/> Detected</span><span><i className="legend-review"/> Needs review</span><span>Example data</span></div>

      </div>

    </div>

  );

}

function DashboardPreview() {

  return (

    <div className="ss-window ss-dashboard-window">

      <div className="ss-bar"><span>app / overview</span><div className="ss-window-user">A</div></div>

      <div className="ss-dash-inner">

        <h3 className="ss-display ss-dash-title">Good evening, Alex</h3>

        <p className="mt-1.5 text-[13px] text-[#8c958a]">Your repositories and recent scans.</p>

        <div className="ss-stat-grid">

          <div className="ss-stat ss-stat-primary"><small>Repositories</small><strong>4</strong><span>Connected</span><GitBranch size={17}/></div>

          <div className="ss-stat"><small>Total scans</small><strong>12</strong><span>All projects</span><ScanSearch size={17}/></div>

          <div className="ss-stat"><small>To review</small><strong>3</strong><span>With evidence</span><ShieldAlert size={17}/></div>

        </div>

        <div className="ss-dash-lower">

          <div className="ss-panel"><b>Recent activity</b>{[["storefront-api","Node.js · PostgreSQL","Completed"],["dashboard-web","React · Vite","Review ready"],["worker-service","Python · Redis","Completed"]].map(([name,sub,status],i)=><div className="ss-repo-row" key={name}><span className="ss-repo-icon"><FolderGit2 size={16}/></span><div className="min-w-0"><b>{name}</b><small>{sub}</small></div><span className={i===1?"ss-review-label":"ss-complete-label"}>{status}</span></div>)}</div>

          <div className="ss-panel"><b>Scan health</b><div className="ss-health-ring"><div><strong>92</strong><small>health</small></div></div></div>

        </div>

      </div>

    </div>

  );

}

function ChatPreview() {

  const [step, setStep] = useState(0);

  useEffect(() => { const id = window.setInterval(() => setStep((s) => (s + 1) % 4), 2600); return () => window.clearInterval(id); }, []);

  return (

    <div className="ss-window ss-chat-window">

      <div className="ss-chat-head"><div className="flex items-center gap-3"><BrandMark small/><div><b>ShipSafe assistant</b><small>Repository intelligence</small></div></div></div>

      <div className="ss-chat-body">

        <div className="ss-chat-user">Review this repository before deployment.</div>

        <div className="ss-chat-assistant"><div className="ss-assistant-icon"><Terminal size={14}/></div><div><p>I found the entry points and mapped the main service boundaries. Two configuration areas are worth a closer look before you release.</p><div className="ss-chat-findings"><span><i/> Architecture mapped</span><span><i className="amber"/> 2 config checks</span></div></div></div>

        <div className="ss-chat-prompt"><span>{["Show me the architecture","Explain the configuration risks","What should I fix first?"][step % 3]}</span><ArrowRight size={15}/></div>

      </div>

      <div className="ss-chat-input"><span>Ask about your repository...</span><span className="ss-chat-send"><ArrowUpRight size={16}/></span></div>

      <div className="ss-chat-disclaimer">Example conversation</div>

    </div>

  );

}

function FeatureVisual({ index }) {

  if (index === 0) {

    return (

      <svg viewBox="0 0 240 132" className="h-full w-full" aria-hidden="true">

        <path d="M120 34 V54 H52 V74 M120 54 H188 V74 M52 98 V108 M188 98 V108" fill="none" stroke="rgba(192,255,0,.45)" strokeWidth="1" strokeDasharray="3 4" />

        <rect x="82" y="12" width="76" height="22" rx="6" fill="#12160f" stroke="rgba(192,255,0,.55)" />

        <rect x="14" y="74" width="76" height="24" rx="6" fill="#12160f" stroke="rgba(255,255,255,.2)" />

        <rect x="150" y="74" width="76" height="24" rx="6" fill="#12160f" stroke="rgba(255,255,255,.2)" />

        <rect x="28" y="108" width="48" height="16" rx="5" fill="#12160f" stroke="rgba(255,255,255,.14)" />

        <rect x="164" y="108" width="48" height="16" rx="5" fill="#12160f" stroke="rgba(255,255,255,.14)" />

        <g fontFamily="Geist Mono, monospace" fontSize="9" fill="#a9b3a4" textAnchor="middle">

          <text x="120" y="27">repo</text><text x="52" y="89">web app</text><text x="188" y="89">api</text><text x="52" y="119">auth</text><text x="188" y="119">database</text>

        </g>

      </svg>

    );

  }

  if (index === 1) {

    return (

      <div className="ss-code">

        <div><span className="ln">12</span><span>const db = connect(env.DB_URL)</span></div>

        <div className="hit"><span className="ln">13</span><span>{'app.use(cors({ origin: "\\*" }))'}</span></div>

        <div><span className="ln">14</span><span>app.listen(PORT)</span></div>

        <p className="ss-code-tag">server/app.js · open CORS policy</p>

      </div>

    );

  }

  return (

    <div>

      {[["Open CORS policy", "high", "#e6c66a"], ["Unpinned dependency", "medium", "#9da99a"], ["Verbose error output", "low", "#5f695c"]].map(([t, l, c], i) => (

        <div className="ss-prio" key={t}><span className="n">{i + 1}</span><span>{t}</span><span className="tag" style={{ color: c }}>{l}</span></div>

      ))}

    </div>

  );

}

function Landing() {

  const root = useRef(null);

  useEffect(() => {

    const ctx = gsap.context(() => {

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

        gsap.set(".ss-step-item", { opacity: 1, clearProps: "transform" });

        gsap.set(".ss-seg > i", { scaleX: 1 });

        const ring = root.current?.querySelector(".ss-health-ring");

        if (ring) { ring.style.setProperty("--health", "92%"); ring.querySelector("strong").textContent = "92"; }

        return;

      }

      // Keep mobile rendering light; desktop keeps the full animation sequence below.
      const isSmallScreen = window.matchMedia("(max-width: 767px)").matches;
      if (isSmallScreen) {
        gsap.set("[data-reveal], .ss-feature-item, .ss-dashboard-window, .ss-chat-window, .ss-hero-copy > *, .ss-hero-visual", {
          opacity: 1, visibility: "visible", clearProps: "transform",
        });
        const ring = root.current?.querySelector(".ss-health-ring");
        if (ring) {
          ring.style.setProperty("--health", "92%");
          const value = ring.querySelector("strong");
          if (value) value.textContent = "92";
        }
        gsap.set(".ss-step-item", { opacity: 1, clearProps: "transform" });
        gsap.set(".ss-seg > i", { scaleX: 1 });
        return;
      }

      gsap.defaults({ ease: "power2.out", overwrite: "auto" });

      gsap.from(".ss-hero-copy > *", { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.09, delay: 0.08 });

      gsap.from(".ss-hero-visual", { y: 24, autoAlpha: 0, duration: 0.9, delay: 0.16 });

      gsap.utils.toArray("[data-reveal], .ss-feature-item, .ss-dashboard-window, .ss-chat-window").forEach((el) => {

        gsap.fromTo(el, { y: 22, autoAlpha: 0 }, {

          y: 0, autoAlpha: 1, duration: 0.7, clearProps: "transform",

          scrollTrigger: { trigger: el, start: "top 88%", once: true, invalidateOnRefresh: true }

        });

      });

      const health = { value: 0 };

      gsap.to(health, {

        value: 92,

        ease: "none",

        onUpdate: () => {

          const ring = root.current?.querySelector(".ss-health-ring");

          if (!ring) return;

          ring.style.setProperty("--health", `${health.value}%`);

          ring.querySelector("strong").textContent = Math.round(health.value);

        },

        scrollTrigger: {

          trigger: ".ss-dashboard-window",

          start: "top 80%",

          end: "top 35%",

          scrub: 0.8,

          invalidateOnRefresh: true

        }

      });

const items = gsap.utils.toArray(".ss-step-item");

      const fills = gsap.utils.toArray(".ss-seg > i");

      ScrollTrigger.create({

        trigger: ".ss-steps", start: "top 82%", end: "bottom 58%", scrub: 0.15,

        onUpdate: ({ progress }) => {

          fills.forEach((el, i) => gsap.set(el, { scaleX: Math.min(1, Math.max(0, progress * 2 - i)) }));

          items.forEach((el, i) => el.classList.toggle("on", progress > i * 0.5 - 0.02));

        }

      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

    }, root);

    return () => ctx.revert();

  }, []);

  return (

    <div ref={root} className="ss-site min-h-screen overflow-x-hidden text-[#e9ede4]">

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');html{scroll-behavior:smooth}section[id]{scroll-margin-top:72px}.ss-site{font-family:'Geist',system-ui,-apple-system,sans-serif;background:#0a0c09;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}.ss-display{font-family:'Geist',system-ui,sans-serif;font-weight:600;letter-spacing:-.035em}.ss-mono{font-family:'Geist Mono',ui-monospace,monospace;letter-spacing:.04em}.ss-hero{padding:104px 20px 64px;display:flex;align-items:center}.ss-hero .ss-wrap{width:100%}.ss-section{padding:72px 20px}.ss-wrap{max-width:1200px;margin:0 auto}.ss-feature-item{position:relative}@media(min-width:640px){.ss-hero{padding:112px 32px 80px}.ss-section{padding:112px 32px}}@media(min-width:1024px){.ss-hero{min-height:min(100vh,960px)}}.ss-hero-title{font-size:clamp(2.5rem,4.7vw,4.2rem);line-height:1.04;letter-spacing:-.045em}.ss-hero-p{margin-top:24px;max-width:470px;font-size:17px;line-height:1.65;color:#9fa89a}.ss-h2{font-size:clamp(1.8rem,3vw,2.6rem);line-height:1.1;letter-spacing:-.04em}.ss-lead{margin-top:16px;max-width:520px;font-size:16px;line-height:1.7;color:#9fa89a}.ss-btn{display:inline-flex;align-items:center;gap:8px;background:#c0ff00;color:#0b0f06;font-weight:600;font-size:14px;height:44px;padding:0 18px;border-radius:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.35);transition:transform .25s,box-shadow .25s}.ss-btn:hover{transform:translateY(-3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 12px 35px rgba(192,255,0,.2)}.ss-link{font-size:14px;font-weight:500;color:#c9d0c4;border-bottom:1px solid rgba(255,255,255,.25);padding-bottom:2px;transition:color .2s,border-color .2s}.ss-link:hover{color:#c0ff00;border-color:#c0ff00}.ss-window{border:1px solid rgba(255,255,255,.10);background:#10130e;border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35)}.ss-bar{height:44px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07);font:12px 'Geist Mono',monospace;color:#a9b3a4}.ss-arch-canvas{position:relative;min-height:440px;padding:28px 30px 18px;background-image:radial-gradient(rgba(255,255,255,.07) .8px,transparent .8px);background-size:19px 19px}.ss-arch-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.ss-flow-line{fill:none;stroke:url(#ss-flow);stroke-width:1.5;stroke-dasharray:5 6;animation:ss-dash 16s linear infinite}.ss-flow-line-delay{opacity:.38;animation-direction:reverse}.ss-flow-particle{fill:#c0ff00;filter:drop-shadow(0 0 5px #c0ff00)}@keyframes ss-dash{to{stroke-dashoffset:-180}}.ss-hero-visual{perspective:1400px}.ss-architecture{transform:rotateY(-5deg) rotateX(2deg);transition:transform .6s}.ss-architecture:hover{transform:rotateY(0) rotateX(0)}.ss-node{position:relative;z-index:2;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.12);background:#12160f;padding:12px;border-radius:9px;min-width:0;color:#c0ff00}.ss-node b{display:block;color:#e8ede3;font-size:12px;font-weight:600;white-space:nowrap}.ss-node small{display:block;color:#7e887c;font:10px 'Geist Mono',monospace;margin-top:4px;white-space:nowrap}.ss-node-root{width:270px;margin:0 auto 80px;border-color:rgba(192,255,0,.3)}.ss-node-state{margin-left:auto;font-size:10px;color:#8f998b}.ss-node-row{display:grid;grid-template-columns:1fr 1fr;gap:100px;margin-bottom:78px}.ss-node-good{border-color:rgba(192,255,0,.22)}.ss-node-row-bottom{grid-template-columns:repeat(3,1fr);gap:14px;margin:0}.ss-node-muted{color:#9da99a}.ss-node-review{color:#e6c66a;border-color:rgba(230,198,106,.3)}.ss-review-dot{width:6px;height:6px;border-radius:50%;background:#e6c66a;margin-left:auto}.ss-arch-legend{position:relative;z-index:2;display:flex;align-items:center;gap:18px;margin-top:22px;color:#8a9486;font-size:11px}.ss-arch-legend span{display:flex;align-items:center;gap:6px}.ss-arch-legend span:last-child{margin-left:auto}.ss-arch-legend i{width:6px;height:6px;border-radius:50%}.legend-good{background:#c0ff00}.legend-review{background:#e6c66a}.ss-window-user{width:24px;height:24px;display:grid;place-items:center;border-radius:50%;background:#c0ff00;color:#111;font-size:11px;font-weight:700}.ss-dash-inner{padding:24px}.ss-dash-title{font-size:24px;letter-spacing:-.03em}.ss-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}.ss-stat{position:relative;padding:15px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(255,255,255,.025)}.ss-stat-primary{background:#c0ff00;color:#10140a;border-color:#c0ff00}.ss-stat small,.ss-stat span{display:block;font-size:11px;color:#9ca698}.ss-stat-primary small,.ss-stat-primary span{color:#26320b}.ss-stat strong{display:block;font-size:28px;letter-spacing:-.04em;margin:10px 0 2px}.ss-stat svg{position:absolute;right:13px;top:14px;color:#c0ff00}.ss-stat-primary svg{color:#26320b}.ss-dash-lower{display:grid;grid-template-columns:1.7fr 1fr;gap:10px;margin-top:10px}.ss-panel{padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:10px;font-size:12px}.ss-panel>b{font-size:13px}.ss-repo-row{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.055)}.ss-repo-row:last-child{border:0}.ss-repo-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:7px;background:rgba(192,255,0,.07);color:#c0ff00}.ss-repo-row b,.ss-repo-row small{display:block}.ss-repo-row b{font-size:12px}.ss-repo-row small{font-size:11px;color:#778173;margin-top:3px}.ss-complete-label,.ss-review-label{margin-left:auto;font-size:11px;color:#c0ff00}.ss-review-label{color:#dfc36c}.ss-health-ring{width:100px;height:100px;margin:20px auto 6px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#c0ff00 0 var(--health,0%),rgba(255,255,255,.08) var(--health,0%) 100%);position:relative}.ss-health-ring:before{content:'';position:absolute;inset:7px;border-radius:50%;background:#10130e}.ss-health-ring div{z-index:1;text-align:center}.ss-health-ring strong{display:block;font-size:24px}.ss-health-ring small{font-size:10px;color:#899384}.ss-chat-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.07)}.ss-chat-head b,.ss-chat-head small{display:block}.ss-chat-head b{font-size:13px}.ss-chat-head small{font-size:11px;color:#828d7f;margin-top:3px}.ss-chat-body{padding:24px 22px 18px;min-height:270px}.ss-chat-user{margin-left:auto;max-width:75%;padding:12px 14px;border:1px solid rgba(192,255,0,.2);background:rgba(192,255,0,.06);border-radius:10px;font-size:13px;color:#e3eadc}.ss-chat-assistant{display:flex;gap:10px;margin-top:20px;max-width:92%;font-size:13px;line-height:1.7;color:#aeb8a8}.ss-assistant-icon{width:27px;height:27px;flex:none;display:grid;place-items:center;border-radius:7px;background:rgba(192,255,0,.09);color:#c0ff00}.ss-chat-findings{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}.ss-chat-findings span{border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:5px 9px;font-size:11px;color:#aeb9a6}.ss-chat-findings i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#c0ff00;margin-right:6px}.ss-chat-findings i.amber{background:#dfc36c}.ss-chat-prompt{display:flex;justify-content:space-between;align-items:center;margin:20px 0 0 37px;padding:9px 12px;border:1px solid rgba(192,255,0,.2);border-radius:8px;color:#c0ff00;font-size:12px}.ss-chat-input{display:flex;justify-content:space-between;align-items:center;margin:0 18px;padding:12px 13px;border:1px solid rgba(255,255,255,.12);border-radius:9px;color:#737e70;font-size:12px}.ss-chat-send{width:26px;height:26px;display:grid;place-items:center;background:#c0ff00;color:#111;border-radius:6px}.ss-chat-disclaimer{text-align:center;padding:10px;font-size:11px;color:#687365}.ss-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}.ss-bg::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,transparent 50%,rgba(0,0,0,.5))}.ss-bg-glow{position:absolute;left:-10%;right:-10%;top:-5%;height:160%;background:radial-gradient(760px 520px at 16% 14%,rgba(192,255,0,.095),transparent 68%),radial-gradient(900px 620px at 88% 58%,rgba(120,145,83,.08),transparent 70%),radial-gradient(700px 480px at 30% 96%,rgba(192,255,0,.05),transparent 70%)}.ss-bg-dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.075) 1px,transparent 1px);background-size:28px 28px;-webkit-mask-image:radial-gradient(ellipse 75% 65% at 50% 40%,#000 10%,transparent 78%);mask-image:radial-gradient(ellipse 75% 65% at 50% 40%,#000 10%,transparent 78%)}.ss-bg-grain{position:absolute;inset:0;opacity:.045;background-image:url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}.ss-fvis{height:176px;padding:18px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.012));border-radius:14px;overflow:hidden;transition:border-color .3s,transform .3s}.ss-feature-item:hover .ss-fvis{border-color:rgba(192,255,0,.35);transform:translateY(-3px)}.ss-feature-flow{animation:ss-feature-flow 2.5s linear infinite}@keyframes ss-feature-flow{to{stroke-dashoffset:-28}}.ss-chat-typing{display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;max-width:0;animation:ss-chat-type 6s steps(68,end) infinite}@keyframes ss-chat-type{0%,8%{max-width:0}68%,88%,100%{max-width:100%}}.ss-terminal-typing{display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;width:0;animation:ss-terminal-type 3.6s steps(12,end) infinite}@keyframes ss-terminal-type{0%,12%{width:0}75%,100%{width:12ch}}.ss-code{font:12px/1.9 'Geist Mono',monospace;color:#8f998b}.ss-code>div{display:flex;gap:12px;padding:0 8px;border-left:2px solid transparent;white-space:nowrap}.ss-code .ln{color:#4f594c;width:16px;text-align:right}.ss-code .hit{background:rgba(230,198,106,.10);border-left-color:#e6c66a;color:#e8ede3}.ss-code-tag{margin-top:12px;font:11px 'Geist Mono',monospace;color:#e6c66a}.ss-prio{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px;color:#d5dbd0}.ss-prio:last-child{border:0}.ss-prio .n{font:11px 'Geist Mono',monospace;color:#c0ff00;width:14px}.ss-prio .tag{margin-left:auto;font:11px 'Geist Mono',monospace}.ss-final-cta{padding-top:92px;padding-bottom:112px}.ss-cta-panel{position:relative;isolation:isolate;display:grid;grid-template-columns:1.08fr .92fr;align-items:center;gap:48px;min-height:390px;padding:clamp(28px,5vw,64px);overflow:hidden;border:1px solid rgba(192,255,0,.2);border-radius:22px;background:linear-gradient(118deg,rgba(192,255,0,.055),transparent 43%),linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018) 48%,rgba(255,255,255,.025));box-shadow:0 30px 90px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.045)}.ss-cta-grid{position:absolute;inset:0;z-index:-2;opacity:.3;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:34px 34px;mask-image:linear-gradient(90deg,black,transparent 80%)}.ss-cta-glow{position:absolute;z-index:-1;width:460px;height:460px;right:4%;top:50%;transform:translateY(-50%);border-radius:50%;background:radial-gradient(circle,rgba(192,255,0,.12),transparent 68%);filter:blur(12px);pointer-events:none}.ss-cta-content{position:relative;z-index:1;max-width:590px}.ss-cta-kicker{display:inline-flex;align-items:center;gap:9px;color:#c0ff00;font-size:10px;letter-spacing:.16em}.ss-cta-pulse{width:7px;height:7px;border-radius:50%;background:#c0ff00;box-shadow:0 0 12px rgba(192,255,0,.8);animation:ss-cta-pulse 2s ease-in-out infinite}@keyframes ss-cta-pulse{50%{opacity:.45;box-shadow:0 0 3px rgba(192,255,0,.35)}}.ss-cta-title{margin-top:22px;font-size:clamp(2.15rem,4vw,3.5rem);line-height:1.06;max-width:580px}.ss-cta-title span{display:block;color:#c0ff00}.ss-cta-copy{margin-top:19px;max-width:490px;color:#9fa89a;font-size:15px;line-height:1.8}.ss-cta-actions{display:flex;flex-wrap:wrap;align-items:center;gap:18px;margin-top:30px}.ss-cta-note{font-size:11px;color:#7f897b}.ss-cta-terminal{position:relative;z-index:1;max-width:440px;width:100%;justify-self:end;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:rgba(8,11,7,.78);box-shadow:0 24px 65px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.045);backdrop-filter:blur(12px);transform:rotate(1.2deg);transition:transform .45s,border-color .45s}.ss-cta-panel:hover .ss-cta-terminal{transform:rotate(0) translateY(-4px);border-color:rgba(192,255,0,.28)}.ss-cta-terminal-top,.ss-cta-terminal-foot{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;color:#7f897b;font:10px 'Geist Mono',monospace}.ss-cta-terminal-top{border-bottom:1px solid rgba(255,255,255,.08)}.ss-cta-terminal-top>span{display:flex;gap:5px}.ss-cta-terminal-top i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.2)}.ss-cta-terminal-top svg{color:#a9b3a4}.ss-cta-terminal-body{padding:23px 19px 20px;font:11px/2.2 'Geist Mono',monospace;color:#dce4d5}.ss-cta-terminal-body p{white-space:nowrap}.ss-cta-terminal-body p>b{color:#c0ff00}.ss-cta-terminal-body .muted{color:#7f897b}.ss-cta-terminal-body .success{color:#c0ff00}.ss-cta-terminal-foot{border-top:1px solid rgba(255,255,255,.07);font-size:9px;letter-spacing:.08em}.ss-cta-terminal-foot span:last-child{color:#c0ff00}.ss-cta-cursor{display:inline-block;width:6px;height:12px;margin-left:5px;vertical-align:-2px;background:#c0ff00;animation:ss-cursor-blink 1s steps(2,start) infinite}@keyframes ss-cursor-blink{to{visibility:hidden}}@media(max-width:767px){.ss-final-cta{padding-top:64px;padding-bottom:76px}.ss-cta-panel{grid-template-columns:1fr;gap:34px;padding:28px 22px;border-radius:17px}.ss-cta-terminal{justify-self:stretch;max-width:none;transform:none}.ss-cta-title{font-size:clamp(2rem,9vw,2.8rem)}.ss-cta-note{width:100%}}.ss-steps{display:grid;gap:44px;grid-template-columns:1fr}.ss-step-item{position:relative;opacity:.38;transition:opacity .5s}.ss-step-item.on{opacity:1}.ss-step-dot{position:relative;z-index:1;width:34px;height:34px;display:grid;place-items:center;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#0a0c09;color:#8f998b;font-size:12px;transition:background .4s,border-color .4s,color .4s,box-shadow .4s}.ss-step-item.on .ss-step-dot{background:#c0ff00;border-color:#c0ff00;color:#0a0c06;box-shadow:0 0 0 5px rgba(192,255,0,.12)}.ss-seg{display:none}@media(min-width:768px){.ss-steps{grid-template-columns:repeat(3,1fr);gap:48px}.ss-seg{display:block;position:absolute;top:17px;left:46px;right:-40px;height:1px;background:rgba(255,255,255,.12);overflow:hidden}.ss-seg i{display:block;height:100%;background:#c0ff00;transform:scaleX(0);transform-origin:left;transition:transform .15s linear}}@media(max-width:767px){.ss-arch-canvas{padding:22px 12px;min-height:390px}.ss-node-row{gap:22px;margin-bottom:72px}.ss-node{padding:9px 7px;gap:6px}.ss-node b{font-size:10px}.ss-node small{font-size:8px}.ss-node-state{display:none}.ss-node-root{margin-bottom:72px;width:220px}.ss-node-row-bottom{gap:6px}.ss-node-row-bottom .ss-node{flex-direction:column;align-items:flex-start}.ss-arch-legend{gap:8px;flex-wrap:wrap}.ss-stat-grid,.ss-dash-lower{grid-template-columns:1fr}.ss-dash-inner{padding:16px}.ss-chat-body{padding:18px 14px}.ss-chat-user{max-width:90%}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ss-flow-line{animation:none}.ss-architecture{transform:none}.ss-nav-progress{transform:scaleX(1)}.ss-cta-pulse,.ss-cta-cursor{animation:none}}

      \
        /* Mobile and tablet refinements. Desktop styling and animations remain unchanged. */
        @media (max-width: 1023px) {
          .ss-wrap { max-width: 100%; }
          .ss-section, .ss-hero { padding-left: clamp(18px, 4vw, 32px); padding-right: clamp(18px, 4vw, 32px); }
          .ss-architecture { transform: none; }
        }
        @media (max-width: 767px) {
          html, body, .ss-site { max-width: 100%; overflow-x: clip; }
          .ss-hero { padding-top: 94px; padding-bottom: 48px; }
          .ss-hero .ss-wrap { gap: 34px; }
          .ss-hero-title { font-size: clamp(2.2rem, 10vw, 3.25rem); line-height: 1.04; }
          .ss-hero-p { margin-top: 17px; font-size: 15px; line-height: 1.65; }
          .ss-hero-copy > .mt-9 { margin-top: 24px; gap: 16px; }
          .ss-section { padding-top: 58px; padding-bottom: 58px; }
          .ss-h2 { font-size: clamp(1.75rem, 8vw, 2.35rem); }
          .ss-lead { font-size: 14px; line-height: 1.7; }
          .ss-window { max-width: 100%; border-radius: 12px; }
          .ss-bar { height: 40px; padding: 0 12px; font-size: 10px; }
          .ss-arch-canvas { min-height: 330px; padding: 18px 9px 14px; overflow: hidden; }
          .ss-node-root { width: min(220px, 78%); margin-bottom: 58px; }
          .ss-node-row { gap: 12px; margin-bottom: 56px; }
          .ss-node { padding: 8px 6px; gap: 5px; }
          .ss-node b { font-size: 9px; }
          .ss-node small { font-size: 7px; white-space: normal; overflow-wrap: anywhere; }
          .ss-node-state { display: none; }
          .ss-node-row-bottom { gap: 5px; }
          .ss-node-row-bottom .ss-node { min-height: 48px; flex-direction: column; align-items: flex-start; }
          .ss-arch-legend { gap: 8px; margin-top: 16px; font-size: 9px; flex-wrap: wrap; }
          .ss-arch-legend span:last-child { margin-left: 0; }
          .ss-dash-inner { padding: 13px; }
          .ss-dash-title { font-size: 19px; }
          .ss-stat-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 15px; }
          .ss-stat { min-width: 0; padding: 10px 8px; }
          .ss-stat strong { font-size: clamp(17px, 5vw, 23px); }
          .ss-stat small, .ss-stat span { font-size: 9px; }
          .ss-stat svg { width: 14px; height: 14px; right: 7px; top: 8px; }
          .ss-dash-lower { grid-template-columns: minmax(0, 1fr); gap: 8px; }
          .ss-panel { min-width: 0; padding: 12px; }
          .ss-repo-row { gap: 7px; }
          .ss-complete-label, .ss-review-label { font-size: 9px; }
          .ss-chat-body { min-height: 0; padding: 16px 12px; }
          .ss-chat-user { max-width: 94%; font-size: 12px; }
          .ss-chat-assistant { max-width: 100%; font-size: 12px; }
          .ss-chat-prompt { margin-left: 0; gap: 8px; font-size: 10px; }
          .ss-chat-input { gap: 8px; font-size: 11px; }
          .ss-steps { gap: 30px; }
          .ss-step-item { opacity: 1; }
          .ss-cta-panel { grid-template-columns: minmax(0, 1fr); gap: 26px; padding: 24px 17px; border-radius: 15px; }
          .ss-cta-title { font-size: clamp(1.9rem, 9vw, 2.55rem); }
          .ss-cta-copy { font-size: 14px; line-height: 1.7; }
          .ss-cta-actions { gap: 14px; }
          .ss-cta-terminal { min-width: 0; max-width: 100%; overflow: hidden; }
          .ss-cta-terminal-body { padding: 16px 12px; font-size: clamp(8px, 2.4vw, 10px); }
          .ss-cta-terminal-body p { white-space: normal; overflow-wrap: anywhere; }
          .ss-cta-terminal-top, .ss-cta-terminal-foot { padding: 11px 12px; }
          .ss-final-cta { padding-top: 48px; padding-bottom: 58px; }
          /* Perpetual decorative effects are disabled on small touch screens only. */
          .ss-flow-line, .ss-feature-flow, .ss-chat-typing, .ss-terminal-typing, .ss-cta-pulse, .ss-cta-cursor { animation: none !important; }
          .ss-chat-typing { max-width: 100%; }
          .ss-terminal-typing { width: 12ch; }
          .ss-bg-glow { filter: none !important; }
          .ss-architecture, .ss-cta-terminal { transform: none !important; }
        }
        @media (max-width: 380px) {
          .ss-hero-title { font-size: 2.1rem; }
          .ss-hero-copy > .mt-9 { align-items: flex-start; flex-direction: column; }
          .ss-stat-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .ss-hero { padding-top: 112px; padding-bottom: 64px; }
          .ss-hero .ss-wrap { gap: 38px; }
          .ss-section { padding-top: 78px; padding-bottom: 78px; }
          .ss-arch-canvas { min-height: 370px; }
          .ss-node-row { gap: 38px; }
          .ss-cta-panel { grid-template-columns: 1fr 1fr; padding: 34px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ss-flow-line, .ss-feature-flow, .ss-chat-typing, .ss-terminal-typing, .ss-cta-pulse, .ss-cta-cursor { animation: none !important; }
        }
      `}</style>

      <div className="ss-bg" aria-hidden="true"><div className="ss-bg-glow" /><div className="ss-bg-dots" /><div className="ss-bg-grain" /></div>

      <Navbar />

      <main className="relative z-[1]">

        <section className="ss-hero">

          <div className="ss-wrap grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] xl:gap-16">

            <div className="ss-hero-copy">

              <h1 className="ss-display ss-hero-title">Understand your code.<br/><span className="text-[#c0ff00]">Ship with confidence.</span></h1>

              <p className="ss-hero-p">Your codebase has a story, and ShipSafe helps you read it. We map the architecture, check the security signals and point out deployment risks before you release.</p>

              <div className="mt-9 flex flex-wrap items-center gap-6">

                <Link to="/signup" className="ss-btn">Analyze a repository <ArrowUpRight size={16}/></Link>

                <a href="#how" className="ss-link">See how it works</a>

              </div>

              <p className="mt-6 text-[13px] text-[#7f897b]">Works with public GitHub repositories.</p>

            </div>

            <div className="ss-hero-visual"><ArchitecturePreview/></div>

          </div>

        </section>

        <section id="product" className="ss-section">

          <div className="ss-wrap">

            <div data-reveal className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">

              <h2 className="ss-display ss-h2 max-w-[560px]">Your repo, read carefully.</h2>

              <p className="ss-lead !mt-0 relative top-3">ShipSafe goes through how your project is built and what could go wrong, then hands you the evidence to decide what to fix.</p>

            </div>

            <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">

              {features.map(({ title, copy }, i) => (

                <div key={title} className="ss-feature-item">

                  <div className="ss-fvis"><FeatureVisual index={i} /></div>

                  <h3 className="ss-display mt-6 text-xl">{title}</h3>

                  <p className="mt-3 max-w-[340px] text-[15px] leading-7 text-[#a0a89b]">{copy}</p>

                </div>

              ))}

            </div>

          </div>

        </section>

        <section id="workspace" className="ss-section">

          <div className="ss-wrap grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">

            <div data-reveal>

              <h2 className="ss-display ss-h2">Everything you’ve scanned, in one place.</h2>

              <p className="ss-lead">Connected repositories, scan history and findings sit in one workspace, so finding the last result doesn’t mean digging.</p>

              <div className="mt-8">

                {workspaceItems.map(([t, p]) => <div key={t} className="border-t border-white/10 py-4"><b className="text-[15px]">{t}</b><p className="mt-1 text-[14px] leading-6 text-[#8f998b]">{p}</p></div>)}

              </div>

            </div>

            <DashboardPreview/>

          </div>

        </section>

        <section id="assistant" className="ss-section">

          <div className="ss-wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            <div className="order-2 lg:order-1"><ChatPreview/></div>

            <div data-reveal className="order-1 lg:order-2">

              <h2 className="ss-display ss-h2">Ask why something matters.</h2>

              <p className="ss-lead">Findings are easier to act on when you can ask about them. Talk through the structure, the risks and what deserves a look first.</p>

              <ul className="mt-7 space-y-3 text-[15px] text-[#c4ccbd]">

                <li className="border-l-2 border-[#c0ff00]/50 pl-4">Ask about the structure and the components that were detected</li>

                <li className="border-l-2 border-[#c0ff00]/50 pl-4">See the risks along with the evidence behind them</li>

                <li className="border-l-2 border-[#c0ff00]/50 pl-4">Decide what to review next</li>

              </ul>

            </div>

          </div>

        </section>

        <section id="how" className="ss-section">

          <div className="ss-wrap">

            <h2 data-reveal className="ss-display ss-h2 max-w-[560px]">From a repo URL to a clear decision.</h2>

            <div className="ss-steps mt-16">

              {steps.map(([t, p], i) => (

                <div key={t} className="ss-step-item">

                  <span className="ss-step-dot ss-mono">0{i + 1}</span>

                  {i < steps.length - 1 && <span className="ss-seg" aria-hidden="true"><i /></span>}

                  <h3 className="ss-display mt-6 text-xl">{t}</h3>

                  <p className="mt-3 max-w-[320px] text-[15px] leading-7 text-[#a0a89b]">{p}</p>

                </div>

              ))}

            </div>

          </div>

        </section>

        <section className="ss-section ss-final-cta">

          <div className="ss-wrap">

            <div className="ss-cta-panel" data-reveal>

              <div className="ss-cta-grid" aria-hidden="true" />

              <div className="ss-cta-glow" aria-hidden="true" />

              <div className="ss-cta-content">

                <div className="ss-cta-kicker ss-mono">

                  <span className="ss-cta-pulse" />

                  READY WHEN YOU ARE

                </div>

                <h2 className="ss-display ss-cta-title">

                  Your next release deserves

                  <span> a closer look.</span>

                </h2>

                <p className="ss-cta-copy">

                  Start with a repository you know. See how it is structured,

                  review the evidence and make a more informed call before you ship.

                </p>

                <div className="ss-cta-actions">

                  <Link to="/signup" className="ss-btn">

                    Get started with ShipSafe <ArrowUpRight size={16} />

                  </Link>

                  <span className="ss-cta-note">Public GitHub repositories · No setup required</span>

                </div>

              </div>

              <div className="ss-cta-terminal" aria-hidden="true">

                <div className="ss-cta-terminal-top">

                  <span><i /><i /><i /></span>

                  <small>terminal · shipsafe</small>

                  <Terminal size={15} />

                </div>

                <div className="ss-cta-terminal-body">

                  <p><b>$</b> shipsafe inspect ./your-repo</p>

                  <p className="muted">→ Mapping project structure...</p>

                  <p className="muted">→ Checking security signals...</p>

                  <p className="success"><b>✓</b> <span className="ss-terminal-typing">Review ready</span><span className="ss-cta-cursor" /></p>

                </div>

                <div className="ss-cta-terminal-foot">

                  <span>LOCAL PREVIEW</span>

                  <span>●&nbsp; READY</span>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      <div className="relative z-[1]"><Footer /></div>

    </div>

  );

}

export default Landing;