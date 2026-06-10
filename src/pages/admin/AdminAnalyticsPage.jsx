import { ExternalLink } from "lucide-react";
import { adminRu } from "../../admin/adminStrings";
import {
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminSaveBar,
  AdminToggle,
  adminInputClass,
} from "../../admin/adminUi";
import { useAdminDraft, useAdminPersist } from "../../admin/adminHelpers";
import { useContent } from "../../context/ContentProvider";
import { DEFAULT_GA_ID } from "../../utils/analytics";

export default function AdminAnalyticsPage() {
  const { siteSettings } = useContent();
  const { contentSaving, saveError, runSave, saveMerged } = useAdminPersist();
  const { draft, setDraft, dirty, reset } = useAdminDraft(siteSettings ?? {});

  const handleSave = async () => {
    const ok = await runSave(() =>
      saveMerged((current) => ({
        ...current,
        siteSettings: {
          googleAnalyticsId: draft.googleAnalyticsId?.trim() || DEFAULT_GA_ID,
          analyticsEnabled: draft.analyticsEnabled !== false,
        },
      }))
    );
    if (ok) reset();
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.analytics}
        description={adminRu.analytics.description}
        actions={
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill border border-border/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-stone transition hover:border-gold/30 hover:text-milk"
          >
            Google Analytics
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        }
      />

      <div className="grid max-w-2xl gap-4">
        <AdminPanel>
          <AdminToggle
            checked={draft.analyticsEnabled !== false}
            onChange={(analyticsEnabled) => setDraft((prev) => ({ ...prev, analyticsEnabled }))}
            label={adminRu.analytics.enabled}
          />
          <p className="mt-3 text-xs text-muted">{adminRu.analytics.consentHint}</p>
        </AdminPanel>

        <AdminPanel>
          <AdminField label={adminRu.analytics.measurementId} hint={adminRu.analytics.measurementHint}>
            <input
              value={draft.googleAnalyticsId ?? DEFAULT_GA_ID}
              onChange={(e) => setDraft((prev) => ({ ...prev, googleAnalyticsId: e.target.value }))}
              placeholder="G-XXXXXXXXXX"
              className={adminInputClass()}
            />
          </AdminField>
        </AdminPanel>

        <AdminPanel className="border-border/30 bg-surface/40">
          <h3 className="font-display text-lg text-milk">{adminRu.analytics.trackedTitle}</h3>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-stone">
            <li>{adminRu.analytics.trackPageViews}</li>
            <li>{adminRu.analytics.trackConsent}</li>
            <li>{adminRu.analytics.trackSpa}</li>
          </ul>
        </AdminPanel>
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={reset} />
    </>
  );
}
