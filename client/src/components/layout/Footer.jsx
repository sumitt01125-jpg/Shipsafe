import { Link } from "react-router-dom";
import { ArrowUpRight, Terminal } from "lucide-react";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Features", href: "/#product" },
      { label: "Workspace", href: "/#workspace" },
      { label: "AI Assistant", href: "/#assistant" },
      { label: "How it works", href: "/#how" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Create account", href: "/signup" },
      { label: "Log in", href: "/login" },
    ],
  },
];

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#090c08] text-[#e9ede4]">
      <div className="pointer-events-none absolute -top-52 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#c0ff00]/[0.035] blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-8 lg:px-10">
        <div className="grid gap-14 border-b border-white/[0.08] pb-16 md:grid-cols-[1.5fr_1fr_1fr] lg:gap-24">
          <div>
            <Link to="/" className="group inline-flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-[#c0ff00]/35 bg-[#c0ff00]/[0.045] text-[#c0ff00] transition-colors duration-300 group-hover:border-[#c0ff00]/70">
                <Terminal size={21} strokeWidth={2} />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#c0ff00] shadow-[0_0_12px_rgba(192,255,0,0.5)]" />
              </span>
              <span className="text-[22px] font-semibold tracking-[-0.05em]">
                ShipSafe
              </span>
            </Link>

            <p className="mt-6 max-w-[340px] text-[15px] leading-7 text-[#919b8d]">
              Understand your codebase, uncover security risks, and make
              better decisions before your next deployment.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#c0ff00]/15 bg-[#c0ff00]/[0.045] px-3.5 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c0ff00] shadow-[0_0_8px_#c0ff00]" />
              <span className="font-mono text-[11px] tracking-wide text-[#b8c6ac]">
                Repository security intelligence
              </span>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#c0ff00]">
                {group.title}
              </h3>

              <div className="flex flex-col items-start gap-4">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="group inline-flex items-center gap-1.5 text-[14px] text-[#929b8d] transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={13}
                      className="translate-y-0.5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="relative border-t border-white/[0.06]">
   <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row lg:px-10">
    <p className="text-xs text-[#737d70]">
      © {new Date().getFullYear()} ShipSafe. All rights reserved.
    </p>

    <p className="text-xs text-[#929b8d]">
      Crafted with <span className="text-[#c0ff00]">♥</span> by{" "}
      <span className="font-semibold text-[#e9ede4]">Sumit</span>
    </p>
  </div>
</div>
      </div>
       </footer>
  );
}

export default Footer;