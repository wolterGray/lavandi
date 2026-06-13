import { Link, useLocation } from "react-router-dom";
import Button from "./Button";
import { getBookingFormPath, scrollToBookingForm } from "../utils/bookVisitScroll";

export function BookVisitLink({ onClick, className = "", children, ...props }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <button
        type="button"
        className={className}
        onClick={(event) => {
          onClick?.(event);
          scrollToBookingForm();
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <Link to={getBookingFormPath()} className={className} onClick={onClick} {...props}>
      {children}
    </Link>
  );
}

export default function BookVisitButton({ onClick, ...props }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <Button
        {...props}
        onClick={(event) => {
          onClick?.(event);
          scrollToBookingForm();
        }}
      />
    );
  }

  return (
    <Button
      {...props}
      href={getBookingFormPath()}
      onClick={onClick}
    />
  );
}
