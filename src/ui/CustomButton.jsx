import Button from "./Button";
import { BOOKSY_URL } from "../constants/theme";

/** @deprecated use Button directly */
function CustomButton({ text, onClick, href = BOOKSY_URL, variant = "primary", size = "md" }) {
  return (
    <Button href={href} onClick={onClick} variant={variant} size={size}>
      {text}
    </Button>
  );
}

export default CustomButton;
