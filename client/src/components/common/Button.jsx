import { ArrowRight } from "lucide-react";

function Button({ children, onClick, variant = "primary" }) {
  const styles =
    variant === "primary"
      ? "bg-lime-400 text-black hover:bg-lime-300"
      : "border border-white/10 text-white hover:bg-white/5";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${styles}`}
    >
      {children}
      <ArrowRight size={17} />
    </button>
  );
}

export default Button;