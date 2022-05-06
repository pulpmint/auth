import * as jwt from "jsonwebtoken";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../constants/misc";
import { IInterErrs } from "../types/misc";

// generate access token
export const generateAccessToken = (email: string, name: string, id: string): string => {
  return jwt.sign({ email, name, id }, process.env.JWT_PRIVATE_KEY!, { expiresIn: "5m" });
};

export const handleAuthErrors = (err: any): string => {
  console.log({ ...err });

  if (err.code && err.code === "P2002") return "User already exists.";
  return "Something went wrong.";
};

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
    return { success: false, msg: "Enter a valid email & password." };
  }

  if (!isEmail) return { success: false, msg: "Enter a valid email." };

  if (!isPassword) return { success: false, msg: "Enter a valid password." };

  return { success: true, msg: "" };
};
