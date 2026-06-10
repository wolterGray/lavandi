import SectionLabel from "./SectionLabel";

export default function SectionTitle({
  children,
  label,
  description,
  align = "center",
  className = "",
}) {
  const alignClass =
    align === "left"
      ? "items-start text-left"
      : align === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <div className={`mb-8 flex flex-col gap-3 md:mb-10 ${alignClass} ${className}`}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <h2 className="section-heading text-balance">{children}</h2>
      {description && (
        <p className="max-w-prose text-base leading-[1.75] text-stone md:text-[17px] md:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}
