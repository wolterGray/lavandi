const variants = {
  primary:
    "bg-gold text-void border border-gold/60 hover:bg-gold-hover hover:border-gold-hover font-bold transition duration-300",
  secondary:
    "bg-transparent text-milk border border-border/50 hover:border-gold/60 hover:text-gold hover:bg-gold/[0.06] transition duration-300",
  ghost:
    "bg-transparent text-stone border border-transparent hover:text-milk transition duration-300",
  light:
    "bg-surface text-milk border border-border/50 hover:border-gold/40 hover:bg-gold/[0.05] transition duration-300",
  outlineLight:
    "bg-transparent text-milk border border-milk/40 hover:bg-gold hover:text-void transition duration-300",
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
