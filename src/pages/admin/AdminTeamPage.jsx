import { useMemo, useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { getAdminSectionKey } from "../../admin/adminNav";
import { getSectionMeta } from "../../admin/adminSectionMeta";
import { publishTeamLocalesFromRussian } from "../../admin/publishCmsFromRu";
import { CMS_AUTHOR_LANG, getLocaleDefaults } from "../../admin/siteContent";
import {
  cloneAtIndex,
  filterAdminList,
  LangTabs,
  useAdminConfirm,
  useAdminDraft,
  useAdminPersist,
  useRegisterAdminDirty,
} from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import {
  AdminButton,
  AdminDraftRecoveryBanner,
  AdminEmptyState,
  AdminField,
  AdminListSearch,
  AdminPageHeader,
  AdminPanel,
  AdminSaveBar,
  AdminSearchEmpty,
  adminInputClass,
} from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

const ROLES = [
  { value: "topMaster", label: "Top Master" },
  { value: "master", label: "Master" },
];

export default function AdminTeamPage() {
  const { team, overrides, getLocaleSection } = useContent();
  const { contentSaving, saveError, runSave, saveMerged } = useAdminPersist();
  const [activeLang, setActiveLang] = useState(CMS_AUTHOR_LANG);
  const [translating, setTranslating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const ruLocaleSource = useMemo(
    () => getLocaleSection(CMS_AUTHOR_LANG, "team", getLocaleDefaults(CMS_AUTHOR_LANG, "team")),
    [getLocaleSection, overrides.locales]
  );

  const previewLocale = useMemo(
    () => getLocaleSection(activeLang, "team", getLocaleDefaults(activeLang, "team")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const {
    draft: teamDraft,
    setDraft: setTeamDraft,
    dirty: teamDirty,
    reset: resetTeam,
    recoveryOffer: teamRecovery,
    acceptRecovery: acceptTeamRecovery,
    dismissRecovery: dismissTeamRecovery,
  } = useAdminDraft(team);
  const {
    draft: localeDraft,
    setDraft: setLocaleDraft,
    dirty: localeDirty,
    reset: resetLocale,
    recoveryOffer: localeRecovery,
    acceptRecovery: acceptLocaleRecovery,
    dismissRecovery: dismissLocaleRecovery,
  } = useAdminDraft(ruLocaleSource);
  const requestConfirm = useAdminConfirm();
  useRegisterAdminDirty(teamDirty || localeDirty);

  const updateMember = (index, patch) => {
    setTeamDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const updateMemberLocale = (memberId, patch) => {
    setLocaleDraft((prev) => ({
      ...prev,
      members: {
        ...prev.members,
        [memberId]: { ...prev.members?.[memberId], ...patch },
      },
    }));
  };

  const addMember = () => {
    const id = `member-${Date.now()}`;
    setTeamDraft((prev) => [...prev, { id, name: "Новый", img: "/team/1.png", role: "master" }]);
    setLocaleDraft((prev) => ({
      ...prev,
      members: {
        ...prev.members,
        [id]: { bio: "", specialties: [] },
      },
    }));
  };

  const removeMember = async (index) => {
    const ok = await requestConfirm({
      title: adminRu.common.confirmDeleteTitle,
      message: adminRu.common.confirmDeleteMessage,
      variant: "danger",
      confirmLabel: adminRu.common.delete,
    });
    if (!ok) return;
    const id = teamDraft[index]?.id;
    setTeamDraft((prev) => prev.filter((_, i) => i !== index));
    if (id) {
      setLocaleDraft((prev) => {
        const members = { ...prev.members };
        delete members[id];
        return { ...prev, members };
      });
    }
  };

  const handleSave = async () => {
    setTranslating(true);
    const ok = await runSave(async () =>
      saveMerged(async (current) => publishTeamLocalesFromRussian(current, teamDraft, localeDraft), "team")
    );
    setTranslating(false);
    if (ok) {
      resetTeam();
      resetLocale();
    }
  };

  const isAuthoring = activeLang === CMS_AUTHOR_LANG;
  const displayLocale = isAuthoring ? localeDraft : previewLocale;
  const filteredTeam = filterAdminList(teamDraft, searchQuery, (member) => {
    const localeMember = displayLocale.members?.[member.id] ?? {};
    return `${member.name} ${member.id} ${localeMember.bio ?? ""}`;
  });
  const sectionSavedAt = getSectionMeta(overrides, getAdminSectionKey("/admin/team"));
  const recoveryOffer = teamRecovery ?? localeRecovery;

  const cloneMember = (index) => {
    const sourceMember = teamDraft[index];
    if (!sourceMember) return;
    const id = `member-${Date.now()}`;
    setTeamDraft((prev) => {
      const next = cloneAtIndex(prev, index, (member) => ({ ...member, id, name: `${member.name} (копия)` }));
      return next;
    });
    const localeMember = localeDraft.members?.[sourceMember.id] ?? { bio: "", specialties: [] };
    setLocaleDraft((prev) => ({
      ...prev,
      members: { ...prev.members, [id]: structuredClone(localeMember) },
    }));
  };

  return (
    <>
      {recoveryOffer ? (
        <AdminDraftRecoveryBanner
          savedAt={recoveryOffer.savedAt}
          onRestore={() => {
            if (teamRecovery) acceptTeamRecovery();
            if (localeRecovery) acceptLocaleRecovery();
          }}
          onDismiss={() => {
            if (teamRecovery) dismissTeamRecovery();
            if (localeRecovery) dismissLocaleRecovery();
          }}
        />
      ) : null}

      <AdminPageHeader
        title={adminRu.nav.team}
        description="Пишите на русском (вкладка RU). При сохранении автоперевод в PL, EN и UA; на сайте показывается язык с иконки."
        sectionSavedAt={sectionSavedAt}
        actions={<AdminButton onClick={addMember}><Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.common.person}</AdminButton>}
      />

      <AdminPanel className="mb-4 grid gap-4">
        <AdminField label={adminRu.common.sectionLabel}><input value={displayLocale.label ?? ""} readOnly={!isAuthoring} onChange={(e) => isAuthoring && setLocaleDraft((p) => ({ ...p, label: e.target.value }))} className={adminInputClass(!isAuthoring ? "cursor-default opacity-80" : "")} /></AdminField>
        <AdminField label={adminRu.common.title}><input value={displayLocale.title ?? ""} readOnly={!isAuthoring} onChange={(e) => isAuthoring && setLocaleDraft((p) => ({ ...p, title: e.target.value }))} className={adminInputClass(!isAuthoring ? "cursor-default opacity-80" : "")} /></AdminField>
        <AdminField label={adminRu.common.description}><textarea value={displayLocale.description ?? ""} readOnly={!isAuthoring} onChange={(e) => isAuthoring && setLocaleDraft((p) => ({ ...p, description: e.target.value }))} rows={2} className={adminInputClass(`resize-y ${!isAuthoring ? "cursor-default opacity-80" : ""}`)} /></AdminField>
      </AdminPanel>

      <p className="mb-3 text-sm text-stone">
        {isAuthoring ? adminRu.cosmetics.authoringHint : adminRu.cosmetics.previewHint}
      </p>
      <LangTabs activeLang={activeLang} onChange={setActiveLang} />
      <AdminListSearch value={searchQuery} onChange={setSearchQuery} />

      {teamDraft.length === 0 ? (
        <AdminEmptyState />
      ) : filteredTeam.length === 0 ? (
        <AdminSearchEmpty />
      ) : (
      <div className="space-y-4">
        {filteredTeam.map((member) => {
          const index = teamDraft.findIndex((entry) => entry.id === member.id);
          const localeMember = displayLocale.members?.[member.id] ?? { bio: "", specialties: [] };
          return (
            <AdminPanel key={`${member.id}-${index}`}>
              <div className="mb-4 flex justify-end gap-1">
                {isAuthoring ? (
                  <AdminButton variant="ghost" onClick={() => cloneMember(index)} aria-label={adminRu.common.clone}>
                    <Copy className="h-4 w-4" />
                  </AdminButton>
                ) : null}
                <AdminButton variant="danger" onClick={() => removeMember(index)}><Trash2 className="h-4 w-4" /></AdminButton>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="ID"><input value={member.id} onChange={(e) => updateMember(index, { id: e.target.value })} className={adminInputClass()} /></AdminField>
                <AdminField label="Имя"><input value={member.name} onChange={(e) => updateMember(index, { name: e.target.value })} className={adminInputClass()} /></AdminField>
                <div className="sm:col-span-2">
                  <AdminImageField
                    folder="team"
                    label={adminRu.common.imageUrl}
                    value={member.img}
                    onChange={(img) => updateMember(index, { img })}
                  />
                </div>
                <AdminField label={adminRu.common.role}>
                  <select value={member.role} onChange={(e) => updateMember(index, { role: e.target.value })} className={adminInputClass()}>
                    {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                  </select>
                </AdminField>
                <div className="sm:col-span-2">
                  <AdminField label={adminRu.common.bio} hint={`${adminRu.common.language}: ${activeLang.toUpperCase()}`}>
                    <textarea value={localeMember.bio ?? ""} readOnly={!isAuthoring} onChange={(e) => isAuthoring && updateMemberLocale(member.id, { bio: e.target.value })} rows={4} className={adminInputClass(`resize-y ${!isAuthoring ? "cursor-default opacity-80" : ""}`)} />
                  </AdminField>
                </div>
                <div className="sm:col-span-2">
                  <AdminField label={adminRu.common.specialties}>
                    <input
                      value={(localeMember.specialties ?? []).join(", ")}
                      readOnly={!isAuthoring}
                      onChange={(e) =>
                        isAuthoring &&
                        updateMemberLocale(member.id, {
                          specialties: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className={adminInputClass(!isAuthoring ? "cursor-default opacity-80" : "")}
                    />
                  </AdminField>
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>
      )}

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={teamDirty || localeDirty} saving={contentSaving || translating} onSave={handleSave} onDiscard={() => { resetTeam(); resetLocale(); }} />
    </>
  );
}
