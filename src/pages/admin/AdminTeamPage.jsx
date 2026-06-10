import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getLocaleDefaults } from "../../admin/siteContent";
import { LangTabs, useAdminDraft, useAdminPersist } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import { AdminButton, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

const ROLES = [
  { value: "topMaster", label: "Top Master" },
  { value: "master", label: "Master" },
];

export default function AdminTeamPage() {
  const { team, overrides, getLocaleSection } = useContent();
  const { contentSaving, saveError, runSave, saveMerged, patchLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");

  const localeSource = useMemo(
    () => getLocaleSection(activeLang, "team", getLocaleDefaults(activeLang, "team")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const { draft: teamDraft, setDraft: setTeamDraft, dirty: teamDirty, reset: resetTeam } = useAdminDraft(team);
  const { draft: localeDraft, setDraft: setLocaleDraft, dirty: localeDirty, reset: resetLocale } = useAdminDraft(localeSource);

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

  const removeMember = (index) => {
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
    const ok = await runSave(() =>
      saveMerged((current) => {
        const next = { ...current, team: teamDraft };
        return patchLocaleBlock(next, activeLang, "team", localeDraft);
      })
    );
    if (ok) {
      resetTeam();
      resetLocale();
    }
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.team}
        description="Фото, роли и биографии терапевтов."
        actions={<AdminButton onClick={addMember}><Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.common.person}</AdminButton>}
      />

      <AdminPanel className="mb-4 grid gap-4">
        <AdminField label={adminRu.common.sectionLabel}><input value={localeDraft.label ?? ""} onChange={(e) => setLocaleDraft((p) => ({ ...p, label: e.target.value }))} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.title}><input value={localeDraft.title ?? ""} onChange={(e) => setLocaleDraft((p) => ({ ...p, title: e.target.value }))} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.description}><textarea value={localeDraft.description ?? ""} onChange={(e) => setLocaleDraft((p) => ({ ...p, description: e.target.value }))} rows={2} className={adminInputClass("resize-y")} /></AdminField>
      </AdminPanel>

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <div className="space-y-4">
        {teamDraft.map((member, index) => {
          const localeMember = localeDraft.members?.[member.id] ?? { bio: "", specialties: [] };
          return (
            <AdminPanel key={`${member.id}-${index}`}>
              <div className="mb-4 flex justify-end">
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
                    <textarea value={localeMember.bio ?? ""} onChange={(e) => updateMemberLocale(member.id, { bio: e.target.value })} rows={4} className={adminInputClass("resize-y")} />
                  </AdminField>
                </div>
                <div className="sm:col-span-2">
                  <AdminField label={adminRu.common.specialties}>
                    <input
                      value={(localeMember.specialties ?? []).join(", ")}
                      onChange={(e) => updateMemberLocale(member.id, { specialties: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                      className={adminInputClass()}
                    />
                  </AdminField>
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={teamDirty || localeDirty} saving={contentSaving} onSave={handleSave} onDiscard={() => { resetTeam(); resetLocale(); }} />
    </>
  );
}
