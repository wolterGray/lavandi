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
    <div className={`mb-10 flex flex-col gap-3 md:mb-14 ${alignClass} ${className}`}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <h2 className="font-display text-display-sm md:text-display-md text-milk text-balance font-medium">
        {children}
      </h2>
      {description && (
        <p className="max-w-xl text-base leading-relaxed text-stone md:text-[17px] md:leading-7">
          {description}
        </p>
      )}
    </div>
  );
}
