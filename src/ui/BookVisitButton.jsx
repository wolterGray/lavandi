import { Link } from "react-router-dom";
import Button from "./Button";

export const BOOKING_PATH = "/booking";

export function BookVisitLink({ onClick, className = "", children, ...props }) {
  return (
    <Link
      to={BOOKING_PATH}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
}

export default function BookVisitButton({ onClick, ...props }) {
  return (
    <Button
      {...props}
      to={BOOKING_PATH}
      onClick={onClick}
    />
  );
}

