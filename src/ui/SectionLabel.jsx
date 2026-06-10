export default function SectionLabel({ children, className = "" }) {
  return <p className={`section-label ${className}`}>{children}</p>;
}
