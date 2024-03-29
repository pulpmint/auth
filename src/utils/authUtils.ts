import { EMAIL_REGEX, PASSWORD_REGEX } from "../constants/misc";
import { IInterErrs } from "../types/misc";

export const validateEmail = (email: string): boolean => {
  if (!email.match(EMAIL_REGEX)) return false;
  return true;
};

export const validatePassword = (password: string): boolean => {
  if (!password.match(PASSWORD_REGEX)) return false;
  return true;
};

export const validateEmailPassword = (
  email: string,
  password: string
): IInterErrs => {
  const isEmail = validateEmail(email);
  const isPassword = validatePassword(password);

  if (!isEmail && !isPassword) {
    return { success: false, message: "Enter a valid email & password." };
  }

  if (!isEmail) {
    return { success: false, message: "Enter a valid email." };
  }

  if (!isPassword) {
    return { success: false, message: "Enter a valid password." };
  }

  return { success: true, message: "" };
};
