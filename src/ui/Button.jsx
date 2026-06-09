const variants = {
  primary:
    "bg-champagne text-void hover:bg-milk border border-transparent",
  secondary:
    "bg-transparent text-milk border border-white/20 hover:border-white/40 hover:bg-white/[0.03]",
  ghost:
    "bg-transparent text-stone border border-transparent hover:text-milk underline-offset-4 hover:underline",
};

const sizes = {
  md: "min-h-[48px] px-6 py-3 text-sm font-medium tracking-wide",
  sm: "min-h-[40px] px-4 py-2 text-xs font-medium tracking-wide",
  lg: "min-h-[52px] px-8 py-3.5 text-sm font-medium tracking-wide",
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
    "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-300 ease-luxury",
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
