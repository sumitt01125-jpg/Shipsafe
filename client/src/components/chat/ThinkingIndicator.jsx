import { Sparkles } from "lucide-react";

/**
 * ShipSafe ThinkingIndicator
 * - Pure CSS animations (no extra dependency), Tailwind for layout
 * - Respects prefers-reduced-motion
 */
function ThinkingIndicator() {
  return (
    <div
      className="ss-enter flex items-center gap-3 py-4"
      role="status"
      aria-live="polite"
      aria-label="ShipSafe is thinking"
    >
      <style>{`
        /* One-time spring entrance */
        @keyframes ss-enter {
          0%   { opacity: 0; transform: translateY(10px) scale(.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ss-enter { animation: ss-enter .55s cubic-bezier(.2,.9,.3,1.25) both; }

        /* Icon: breathing glow + sparkle twinkle */
        @keyframes ss-glow {
          0%, 100% { opacity: .35; transform: scale(1); }
          50%      { opacity: .85; transform: scale(1.35); }
        }
        .ss-glow { animation: ss-glow 2.4s ease-in-out infinite; }

        @keyframes ss-twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          40%      { transform: scale(1.18) rotate(14deg); }
          70%      { transform: scale(.92) rotate(-8deg); }
        }
        .ss-twinkle { animation: ss-twinkle 2.4s ease-in-out infinite; }

        /* Bubble: light travelling around the border */
        @keyframes ss-spin { to { transform: rotate(360deg); } }
        .ss-border::before {
          content: "";
          position: absolute;
          inset: -150%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 250deg,
            rgba(163, 230, 53, .0) 270deg,
            rgba(163, 230, 53, .9) 340deg,
            transparent 360deg
          );
          animation: ss-spin 2.8s linear infinite;
        }

        /* Text: soft shimmer sweep */
        @keyframes ss-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .ss-shimmer {
          background: linear-gradient(
            100deg,
            #9ca3af 35%,
            #ecfccb 50%,
            #9ca3af 65%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: ss-shimmer 2.6s linear infinite;
        }

        /* Dots: travelling wave with glow */
        @keyframes ss-wave {
          0%, 60%, 100% {
            transform: translateY(0) scale(1);
            opacity: .35;
            box-shadow: 0 0 0 rgba(163, 230, 53, 0);
          }
          30% {
            transform: translateY(-5px) scale(1.25);
            opacity: 1;
            box-shadow: 0 0 10px rgba(163, 230, 53, .85);
          }
        }
        .ss-dot { animation: ss-wave 1.3s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ss-enter, .ss-glow, .ss-twinkle, .ss-shimmer, .ss-dot,
          .ss-border::before { animation: none !important; }
          .ss-shimmer { color: #d1d5db; background: none; }
          .ss-dot { opacity: .8; }
        }
      `}</style>

      {/* AI ICON */}
      <div className="relative w-9 h-9 shrink-0">
        <div className="ss-glow absolute inset-0 rounded-xl bg-lime-400/30 blur-md" />
        <div className="relative w-full h-full rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
          <Sparkles size={18} className="ss-twinkle text-lime-400" />
        </div>
      </div>

      {/* THINKING BUBBLE (animated border) */}
      <div className="ss-border relative overflow-hidden rounded-2xl p-px bg-white/[0.07]">
        <div className="relative rounded-[15px] bg-[#101612] px-4 py-3">
          <p className="ss-shimmer text-sm font-medium">ShipSafe is thinking</p>

          {/* WAVE DOTS */}
          <div className="flex items-center gap-1.5 mt-2.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="ss-dot w-1.5 h-1.5 rounded-full bg-lime-400"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThinkingIndicator;