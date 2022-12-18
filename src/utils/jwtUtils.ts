import * as jwt from "jsonwebtoken";
import Redis from "../lib/Redis";

// decode & verify token
export const decodeToken = (token: string, secret: string) =>
  new Promise<jwt.JwtPayload | null>(async resolve => {
    const key = await Redis.get(token);

    if (!!key) {
      resolve(null);
      return;
    }

    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        resolve(null);
        return;
      } else {
        resolve(payload as jwt.JwtPayload);
        return;
      }
    });
  });

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
