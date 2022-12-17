import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import Prisma from "../lib/Prisma";

export const getUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = res.locals.payload as JwtPayload;
    const userID = payload.aud as string;

    const user = await Prisma.user.findUnique({
      where: { id: userID },
      select: {
        name: true,
        email: true,
        id: true
      }
    });

    if (!user) {
      next(createHttpError(400, { message: "User does not exist." }));
      return;
    }

    res.status(200).json({ data: user });
    return;
  } catch (err) {
    next(err);
  }
};
