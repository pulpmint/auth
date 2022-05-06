import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const prisma = new PrismaClient();

export const getUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;

    const user = await prisma.user.findUnique({
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
