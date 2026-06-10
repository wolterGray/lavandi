import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { useTranslation } from "../i18n/LanguageProvider";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="section-label">{t("notFound.label")}</p>
      <div className="spa-divider" />
      <h1 className="mt-6 font-display text-3xl text-milk">{t("notFound.title")}</h1>
      <p className="mt-4 max-w-md text-stone">{t("notFound.description")}</p>
      <Link to="/" className="mt-8">
        <Button>{t("common.home")}</Button>
      </Link>
    </div>
  );
}
