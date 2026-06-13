import { BOOKING_FORM_HASH, BOOKING_FORM_ID } from "../constants/theme";

export function scrollToBookingForm() {
  document.getElementById(BOOKING_FORM_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function getBookingFormPath() {
  return `/${BOOKING_FORM_HASH}`;
}
