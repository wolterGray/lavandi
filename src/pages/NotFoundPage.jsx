import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { useTranslation } from "../i18n/LanguageProvider";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{t("notFound.label")}</p>
      <h1 className="mt-4 font-display text-3xl text-milk">{t("notFound.title")}</h1>
      <p className="mt-4 max-w-md text-stone">{t("notFound.description")}</p>
      <Link to="/" className="mt-8">
        <Button>{t("common.home")}</Button>
      </Link>
    </div>
  );
}
