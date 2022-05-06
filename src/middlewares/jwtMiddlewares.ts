import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import * as jwt from "jsonwebtoken";

// validate token
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
  secret: string
) => {
  try {
    const { authorization } = req.headers;

    // check for refresh token
    if (!authorization) {
      next(createHttpError(401, { message: "Missing access token." }));
      return;
    }

    const token = authorization.replace("Bearer", "").trim();

    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        next(createHttpError(403, { message: "Invalid token." }));
        return;
      }

      // @ts-ignore
      res.locals.userID = payload.aud;
      next();
    });
  } catch (err) {
    next(err);
  }
};
