import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { decodeToken } from "../utils/jwtUtils";

// validate token
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  secret: string
) => {
  try {
    const { authorization } = req.headers;

    // check for token
    if (!authorization) {
      next(createHttpError(401, { message: "Missing token." }));
      return;
    }

    // verify token
    const payload = await decodeToken(authorization, secret);

    if (!payload) {
      next(createHttpError(403, { message: "Invalid token." }));
      return;
    }

    res.locals.payload = payload;
    next();
  } catch (err) {
    next(err);
  }
};
