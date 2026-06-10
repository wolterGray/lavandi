import { FaPhoneAlt } from "react-icons/fa";
import { useTranslation } from "../i18n/LanguageProvider";
import { PHONE, PHONE_DISPLAY } from "../constants/theme";

export default function CallWidget({ phone = PHONE_DISPLAY }) {
  const { t } = useTranslation();
  return (
    <a
      href={`tel:${PHONE}`}
      aria-label={t("call.label", { phone })}
      className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-void shadow-spa transition duration-300 hover:bg-gold-dark md:bottom-8 md:right-8 md:h-14 md:w-14"
    >
      <FaPhoneAlt className="text-sm md:text-base" />
    </a>
  );
}
