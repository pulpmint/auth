import * as jwt from "jsonwebtoken";

// generate access token
export const generateAccessToken = (
  email: string,
  name: string,
  id: string
): string => {
  const options: jwt.SignOptions = {
    issuer: "pulpmint",
    audience: id,
    expiresIn: "1h"
  };
  return jwt.sign({ email, name, id }, process.env.JWT_ACCESS_KEY!, options);
};

// generate refresh token
export const generateRefreshToken = (id: string): string => {
  const options: jwt.SignOptions = {
    issuer: "pulpmint",
    audience: id,
    expiresIn: "30d"
  };
  return jwt.sign({}, process.env.JWT_REFRESH_KEY!, options);
};
