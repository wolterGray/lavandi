const variants = {
  primary:
    "bg-gradient-to-r from-[#c59b27] via-[#b8860b] to-[#967048] text-[#f5ebd6] border border-[#d4af37]/40 hover:brightness-115 font-bold",
  secondary:
    "bg-transparent text-[#c59b27] border border-[#b8860b]/70 hover:border-[#c59b27] hover:text-[#f5ebd6] hover:bg-[#b8860b]",
  ghost:
    "bg-transparent text-[#b8860b] border border-transparent hover:text-[#c59b27]",
  light:
    "bg-[#130b1e] text-[#c59b27] border border-[#b8860b]/50 hover:border-[#c59b27] hover:bg-[#b8860b]/20",
  outlineLight:
    "bg-transparent text-[#c59b27] border border-[#b8860b]/70 hover:bg-[#b8860b] hover:text-[#f5ebd6]",
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
