import { useRef, useState } from "react";
import {
  Paperclip,
  ArrowRight,
  GitBranch,
  X,
  File,
  CornerDownLeft,
} from "lucide-react";
/**
 * ShipSafe ChatInput (premium)
 * - Focus: light travels around the border (crisp 1px ring, sharp corners kept)
 * - Busy (disabled): ring stays alive + indeterminate progress line on top
 * - Send button: glow + light sweep when ready, arrow "launches" on send
 * - File chips animate in, drag & drop with animated overlay
 * - Pure CSS + React state, respects prefers-reduced-motion
 */

function ChatInput({ onSend, disabled, onDraftChange }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [launching, setLaunching] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const hasText = Boolean(message.trim());

  const updateMessage = (value) => {
    setMessage(value);
    onDraftChange?.(Boolean(value.trim()));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message);
    updateMessage("");
    setFiles([]);
    setLaunching(true);
    setTimeout(() => setLaunching(false), 650);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((previous) => [...previous, ...selectedFiles]);
    event.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index)
    );
  };
  /* Drag & drop */

  const handleDragOver = (event) => {
    if (disabled) return;
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(event.dataTransfer?.files || []);
    if (dropped.length) setFiles((previous) => [...previous, ...dropped]);
  };

  return (
    <div
      className="workspace-composer-frame cp-shell cp-enter relative"
      data-busy={disabled ? "true" : "false"}
    >
      <style>{`
        @property --cp-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        /* Entrance */
        @keyframes cp-enter {
          0%   { opacity: 0; transform: translateY(14px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .cp-enter { animation: cp-enter .7s cubic-bezier(.16,1,.3,1) both; }
        /* Border ring: only the 1px edge is painted, light travels around */
        @keyframes cp-rotate { to { --cp-angle: 360deg; } }
        .cp-ring {
          position: absolute;
          inset: -1px;
          padding: 1px;
          pointer-events: none;
          z-index: 2;
          opacity: 0;
          transition: opacity .45s ease;
          background: conic-gradient(
            from var(--cp-angle),
            transparent 0%,
            transparent 58%,
            rgba(192,255,0,.12) 74%,
            rgba(192,255,0,.95) 92%,
            #f3ffc2 98%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
          animation: cp-rotate 4.5s linear infinite;
        }
        .cp-shell:focus-within .cp-ring { opacity: 1; }
        .cp-shell[data-busy="true"] .cp-ring { opacity: .75; animation-duration: 2.6s; }
        /* Ambient glow under the composer */
        .cp-glow {
          position: absolute;
          left: 6%; right: 6%; bottom: -14px; height: 40px;
          background: radial-gradient(ellipse at center, rgba(192,255,0,.28), transparent 70%);
          filter: blur(18px);
          opacity: 0;
          transition: opacity .5s ease;
          pointer-events: none;
        }
        .cp-shell:focus-within .cp-glow,
        .cp-shell[data-busy="true"] .cp-glow { opacity: 1; }
        /* Busy: indeterminate progress line */
        @keyframes cp-progress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(260%); }
        }
        .cp-progress {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          overflow: hidden; z-index: 3; pointer-events: none;
          opacity: 0; transition: opacity .3s ease;
        }
        .cp-progress::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, #C0FF00, transparent);
          animation: cp-progress 1.5s cubic-bezier(.4,0,.2,1) infinite;
        }
        .cp-shell[data-busy="true"] .cp-progress { opacity: 1; }
        /* File chips */
        @keyframes cp-chip {
          0%   { opacity: 0; transform: translateY(8px) scale(.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cp-chip {
          animation: cp-chip .45s cubic-bezier(.16,1,.3,1) both;
          animation-delay: var(--cp-delay, 0ms);
        }
        /* Attach: plus rotates */
        .cp-plus { display: inline-block; transition: transform .35s cubic-bezier(.34,1.56,.64,1); }
        .cp-attach:hover:not(:disabled) .cp-plus { transform: rotate(90deg) scale(1.15); }
        /* Hint fades in only while typing */
        .cp-hint { opacity: 0; transform: translateX(6px); transition: opacity .3s ease, transform .3s ease; }
        .cp-hint[data-show="true"] { opacity: 1; transform: translateX(0); }
        /* Send button */
        @keyframes cp-ready {
          0%, 100% { box-shadow: 0 0 0 0 rgba(192,255,0,.0), 0 0 14px rgba(192,255,0,.25); }
          50%      { box-shadow: 0 0 0 6px rgba(192,255,0,.0), 0 0 26px rgba(192,255,0,.5); }
        }
        @keyframes cp-sheen {
          0%   { transform: translateX(-130%) skewX(-20deg); }
          55%, 100% { transform: translateX(260%) skewX(-20deg); }
        }
        .cp-send {
          position: relative; overflow: hidden;
          transition: transform .2s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
        }
        .cp-send[data-ready="true"] { animation: cp-ready 2.4s ease-in-out infinite; }
        .cp-send[data-ready="true"]::after {
          content: ""; position: absolute; top: 0; bottom: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
          animation: cp-sheen 3.2s ease-in-out infinite;
        }
        .cp-send[data-ready="true"]:hover { transform: translateY(-2px); }
        .cp-send:active:not(:disabled) { transform: scale(.92); }
        @keyframes cp-launch {
          0%   { transform: translateX(0); opacity: 1; }
          45%  { transform: translateX(140%); opacity: 0; }
          46%  { transform: translateX(-140%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .cp-launch { animation: cp-launch .6s cubic-bezier(.5,0,.2,1); }
        /* Drop overlay */
        @keyframes cp-drop {
          0%   { opacity: 0; transform: scale(.985); }
          100% { opacity: 1; transform: scale(1); }
        }
        .cp-drop { animation: cp-drop .25s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .cp-enter, .cp-ring, .cp-progress::after, .cp-chip, .cp-drop,
          .cp-send[data-ready="true"], .cp-send[data-ready="true"]::after,
          .cp-launch { animation: none !important; }
          .cp-plus, .cp-hint, .cp-send { transition: none !important; }
        }
        /* Responsive composer: desktop layout and animations remain unchanged. */
        @media (max-width: 640px) {
          .workspace-composer-frame { width: 100%; }
          .workspace-composer { border-radius: 14px; }
          .workspace-composer textarea {
            min-height: 82px;
            max-height: 150px;
            padding: 14px 15px 10px;
            font-size: 16px;
            line-height: 1.6;
          }
          .workspace-composer > div:last-child {
            align-items: flex-start;
            gap: 10px;
            padding: 0 12px 12px;
          }
          .workspace-composer > div:last-child > div:first-child {
            min-width: 0;
            gap: 7px;
          }
          .workspace-composer > div:last-child > div:first-child > span {
            max-width: 100%;
            padding: 8px 9px;
            font-size: 10px;
          }
          .workspace-composer .cp-attach {
            padding: 8px 10px;
            font-size: 11px;
          }
          .workspace-composer > div:last-child > div:last-child {
            gap: 0;
            margin-left: auto;
          }
          .workspace-composer .cp-send {
            width: 42px;
            height: 42px;
            flex: 0 0 42px;
          }
          .workspace-composer .cp-hint { display: none; }
          .workspace-composer-frame .cp-glow { bottom: -10px; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .workspace-composer textarea {
            min-height: 92px;
            max-height: 170px;
          }
          .workspace-composer > div:last-child { gap: 10px; }
        }
      `}</style>
      <div className="cp-glow" aria-hidden="true" />
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="workspace-composer relative z-[1] border border-white/55 bg-[#11120f] transition-colors duration-200 focus-within:border-transparent"
      >
        <div className="cp-ring" aria-hidden="true" />
        <div className="cp-progress" aria-hidden="true" />
        {dragging && (
          <div className="cp-drop absolute inset-0 z-[4] flex items-center justify-center gap-2 border border-dashed border-[#C0FF00]/70 bg-[#11120f]/92 font-mono text-[12px] text-[#C0FF00]">
            <Paperclip size={14} />
            Drop files to attach
          </div>
        )}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 pt-4">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="cp-chip flex max-w-full items-center gap-2 border border-white/15 bg-white/[0.04] px-3 py-2 transition-colors duration-200 hover:border-[#C0FF00]/40"
                style={{ "--cp-delay": `${index * 60}ms` }}
              >
                <File size={14} className="shrink-0 text-[#C0FF00]" />
                <span className="max-w-[180px] truncate text-[11px] text-slate-300">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-1 p-0.5 text-slate-500 transition hover:rotate-90 hover:bg-red-400/10 hover:text-red-300"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(event) => {
            updateMessage(event.target.value);
            event.target.style.height = "auto";
            event.target.style.height = `${Math.min(
              event.target.scrollHeight,
              190
            )}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="github.com/your-org/your-repo"
          rows={2}
          disabled={disabled}
          className="block min-h-[100px] max-h-[190px] w-full resize-none bg-transparent px-5 pb-3 pt-5 font-mono text-[14px] leading-7 text-slate-100 caret-[#C0FF00] outline-none placeholder:text-slate-400/90 disabled:cursor-not-allowed disabled:opacity-50 md:px-6"
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 md:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="cp-attach inline-flex items-center gap-2 border border-white/15 px-3 py-2.5 font-mono text-[12px] text-slate-400 transition hover:border-[#C0FF00]/60 hover:text-[#C0FF00] disabled:opacity-40"
            >
              <span className="cp-plus text-[#C0FF00]">+</span> Attach
            </button>
            <span className="inline-flex items-center gap-2 border border-white/65 px-4 py-2.5 font-mono text-[12px] text-slate-100">
              <GitBranch size={14} className="text-[#C0FF00]" />
              Repository analysis
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="cp-hint hidden items-center gap-1.5 font-mono text-[11px] text-slate-500 sm:inline-flex"
              data-show={hasText && !disabled}
            >
              <CornerDownLeft size={12} /> Enter to send
            </span>
            <button
              type="submit"
              disabled={!hasText || disabled}
              data-ready={hasText && !disabled}
              className="cp-send group flex h-11 w-11 items-center justify-center border border-[#C0FF00]/20 bg-[#C0FF00] text-[#11150d] disabled:cursor-not-allowed disabled:opacity-30"
              title="Send message"
              aria-label="Send message"
            >
              <ArrowRight
                size={20}
                strokeWidth={2}
                className={`relative z-[1] transition-transform duration-200 group-hover:translate-x-0.5 ${
                  launching ? "cp-launch" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
