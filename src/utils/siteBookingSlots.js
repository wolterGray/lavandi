const CRM_TO_SITE_MASTER = {
  Ольга: "Olha",
  Максим: "Max",
};

export const formatSiteBookingSlotLabel = (slot, t) => {
  const masterLabel = CRM_TO_SITE_MASTER[slot.master] || slot.master;
  const priceLabel =
    slot.finalPrice !== undefined && slot.finalPrice !== null
      ? t("booking.form.slotPrice", {price: slot.finalPrice})
      : "";

  return t("booking.form.slotOption", {
    master: masterLabel,
    price: priceLabel,
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
