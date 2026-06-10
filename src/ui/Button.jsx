const variants = {
  primary:
    "bg-gold text-void border border-gold/60 hover:bg-gold-dark hover:border-gold-dark shadow-[0_2px_12px_rgba(184,149,107,0.12)] hover:shadow-[0_4px_16px_rgba(150,112,72,0.2)]",
  secondary:
    "bg-transparent text-milk border border-border/50 hover:border-gold/40 hover:text-gold hover:bg-gold/[0.04]",
  ghost:
    "bg-transparent text-stone border border-transparent hover:text-milk",
  light:
    "bg-surface text-milk border border-border/50 hover:border-gold/30 hover:bg-gold/[0.03]",
  outlineLight:
    "bg-transparent text-milk border border-milk/40 hover:bg-milk hover:text-void",
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
