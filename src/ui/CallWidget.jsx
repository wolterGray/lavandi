import { FaPhoneAlt } from "react-icons/fa";
import { useTranslation } from "../i18n/LanguageProvider";
import { PHONE, PHONE_DISPLAY } from "../constants/theme";

function CallWidget({ phone = PHONE_DISPLAY }) {
  const { t } = useTranslation();

  return (
    <a
      href={`tel:${PHONE}`}
      aria-label={t("call.label", { phone })}
      className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-graphite/90 text-gold backdrop-blur-md transition duration-300 hover:border-gold/30 hover:text-champagne md:bottom-8 md:right-8 md:h-14 md:w-14"
    >
      <FaPhoneAlt className="text-sm md:text-base" />
    </a>
  );
}

export default CallWidget;
