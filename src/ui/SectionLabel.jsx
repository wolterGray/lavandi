export default function SectionLabel({ children, className = "" }) {
  return (
    <p
      className={`text-[11px] font-medium uppercase tracking-[0.22em] text-muted ${className}`}
    >
      {children}
    </p>
  );
}
