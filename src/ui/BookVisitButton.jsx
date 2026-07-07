import Button from "./Button";
import { useContent } from "../context/ContentProvider";
import { BOOKSY_URL } from "../constants/theme";

export function BookVisitLink({ onClick, className = "", children, ...props }) {
  const { contact } = useContent();
  const url = contact?.booksyUrl || BOOKSY_URL;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  );
}

export default function BookVisitButton({ onClick, ...props }) {
  const { contact } = useContent();
  const url = contact?.booksyUrl || BOOKSY_URL;

  return (
    <Button
      {...props}
      href={url}
      onClick={onClick}
    />
  );
}

