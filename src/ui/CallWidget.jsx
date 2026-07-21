import { FaPhoneAlt } from "react-icons/fa";
import { useTranslation } from "../i18n/LanguageProvider";
import { PHONE, PHONE_DISPLAY } from "../constants/theme";

export default function CallWidget({ phone = PHONE_DISPLAY }) {
  const { t } = useTranslation();
  return (
    <a
      href={`tel:${PHONE}`}
      aria-label={t("call.label", { phone })}
      className="call-widget fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#c89f65] text-[#08060c] shadow-spa transition duration-300 hover:bg-[#b38848] md:bottom-8 md:right-8"
    >
      <FaPhoneAlt className="text-sm md:text-base" />
    </a>
  );
}
