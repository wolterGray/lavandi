const CRM_TO_SITE_MASTER = {
  Ольга: "Olha",
  Максим: "Max",
};

export const formatSiteBookingSlotLabel = (slot, t) => {
  const masterLabel = CRM_TO_SITE_MASTER[slot.master] || slot.master;

  return t("booking.form.slotOption", {
    master: masterLabel,
    time: slot.startTime,
  });
};

export const parseSiteBookingSlotValue = (value) => {
  const [startTime = "", master = ""] = String(value ?? "").split("|");

  return {
    master,
    startTime,
  };
};

export const buildSiteBookingSlotValue = (slot) =>
  `${slot.startTime}|${slot.master}`;
