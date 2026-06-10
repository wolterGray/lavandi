import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import en from "../../i18n/locales/en.json";
import pl from "../../i18n/locales/pl.json";
import uk from "../../i18n/locales/uk.json";
import { useAdminPersist } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import { AdminButton, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

const LANGS = [
  { code: "pl", label: "PL", defaults: pl.faq.items },
  { code: "en", label: "EN", defaults: en.faq.items },
  { code: "uk", label: "UA", defaults: uk.faq.items },
];

export default function AdminFaqPage() {
  const { overrides } = useContent();
  const { contentSaving, saveError, runSave, updateSection } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");
  const [draft, setDraft] = useState({});
  const [dirty, setDirty] = useState(false);

  const defaults = useMemo(
    () => Object.fromEntries(LANGS.map(({ code, defaults: items }) => [code, items])),
    []
  );

  useEffect(() => {
    const next = {};
    LANGS.forEach(({ code }) => {
      next[code] = overrides.faq?.[code] ?? defaults[code];
    });
    setDraft(next);
    setDirty(false);
  }, [overrides.faq, defaults]);

  const items = draft[activeLang] ?? [];

  const updateItem = (index, patch) => {
    setDraft((prev) => ({
      ...prev,
      [activeLang]: prev[activeLang].map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
    setDirty(true);
  };

  const addItem = () => {
    setDraft((prev) => ({
      ...prev,
      [activeLang]: [...(prev[activeLang] ?? []), { question: "", answer: "" }],
    }));
    setDirty(true);
  };

  const removeItem = (index) => {
    setDraft((prev) => ({
      ...prev,
      [activeLang]: prev[activeLang].filter((_, i) => i !== index),
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    const ok = await runSave(() => updateSection("faq", draft));
    if (ok) setDirty(false);
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.faq}
        description="Редактируйте вопросы и ответы для каждого языка сайта отдельно."
        actions={<AdminButton onClick={addItem}><Plus className="mr-1 h-3.5 w-3.5" /> Добавить вопрос</AdminButton>}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => setActiveLang(code)}
            className={`rounded-pill border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
              activeLang === code
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-border/50 text-stone hover:border-gold/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <AdminPanel key={`${activeLang}-${index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{adminRu.common.question} {index + 1}</p>
              <AdminButton variant="danger" onClick={() => removeItem(index)} aria-label={adminRu.common.delete}>
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
            <div className="space-y-4">
              <AdminField label={adminRu.common.question}>
                <input
                  value={item.question}
                  onChange={(event) => updateItem(index, { question: event.target.value })}
                  className={adminInputClass()}
                />
              </AdminField>
              <AdminField label={adminRu.common.answer}>
                <textarea
                  value={item.answer}
                  onChange={(event) => updateItem(index, { answer: event.target.value })}
                  rows={4}
                  className={adminInputClass("resize-y")}
                />
              </AdminField>
            </div>
          </AdminPanel>
        ))}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={() => {
        const next = {};
        LANGS.forEach(({ code }) => {
          next[code] = overrides.faq?.[code] ?? defaults[code];
        });
        setDraft(next);
        setDirty(false);
      }} />
    </>
  );
}
