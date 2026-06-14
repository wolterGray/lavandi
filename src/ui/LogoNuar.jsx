import SiteImage from "./SiteImage";

function LogoNuar({ className = "", gold = true }) {
  return (
    <div className={`mb-2 sm:mb-4 justify-center max-w-[90px] sm:max-w-20 md:max-w-30 lg:max-w-32 ${className}`}>
      <SiteImage
        src="/logo_nuar.PNG"
        alt="NUAR — studio masażu premium"
        wrapperClassName="max-w-full"
        className={`max-w-full h-auto ${gold ? "logo-gold" : ""}`}
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
}

export default LogoNuar;
