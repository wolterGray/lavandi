const variants = {
  primary:
    "bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#b8956b] text-[#0c0a10] border border-[#f3e098]/40 hover:brightness-110 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_28px_rgba(212,175,55,0.45)] font-semibold",
  secondary:
    "bg-transparent text-[#e5c158] border border-[#d4af37]/60 hover:border-[#d4af37] hover:text-white hover:bg-[#d4af37]/10 shadow-[0_2px_12px_rgba(212,175,55,0.1)]",
  ghost:
    "bg-transparent text-[#c5a059] border border-transparent hover:text-[#f3e098]",
  light:
    "bg-[#130b1e] text-[#e5c158] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#d4af37]/10",
  outlineLight:
    "bg-transparent text-[#e5c158] border border-[#d4af37]/60 hover:bg-[#d4af37] hover:text-[#0c0a10]",
};

const sizes = {
  md: "min-h-[48px] px-7 py-3 font-display text-[11px] font-bold uppercase tracking-[0.2em]",
  sm: "min-h-[42px] px-5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.18em]",
  lg: "min-h-[52px] px-9 py-3.5 font-display text-xs font-bold uppercase tracking-[0.22em]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  onClick,
  type = "button",
  ...props
}) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-pill transition-all duration-300 ease-luxury",
    variants[variant],
    sizes[size],
    className,
  ].join(" ");

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={classes}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}
