import {
  FaAward,
  FaCalendarCheck,
  FaComments,
  FaMapMarkerAlt,
  FaSpa,
  FaStar,
  FaUsers,
} from "react-icons/fa";

export const STAT_ICONS = {
  clients: FaUsers,
  experience: FaAward,
  reviews: FaComments,
  rating: FaStar,
  rituals: FaSpa,
};

export const VISIT_STEP_ICONS = {
  ritual: FaSpa,
  book: FaCalendarCheck,
  arrive: FaMapMarkerAlt,
};

export function StatIcon({ id }) {
  const Icon = STAT_ICONS[id];
  if (!Icon) return null;
  return <Icon className="block h-[15px] w-[15px] text-gold" aria-hidden="true" />;
}

export function VisitStepIcon({ id }) {
  const Icon = VISIT_STEP_ICONS[id];
  if (!Icon) return null;
  return <Icon className="block h-[15px] w-[15px] text-gold" aria-hidden="true" />;
}
