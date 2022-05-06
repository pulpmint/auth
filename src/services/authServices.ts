import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { generateAccessToken, validateEmailPassword } from "../utils/authUtils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// register user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;

    // check for empty fields
    if (!email || !password || !name) {
      next(createError(400, { message: "Please enter the required fields." }));
      return;
    }

    // validations
    const isEmailPassword = validateEmailPassword(email, password);

    if (!isEmailPassword.success) {
      next(createError(400, isEmailPassword.message));
      return;
    }

    // generate hash password
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await prisma.user.create({
      data: { email, password: hashPassword, name }
    });

    res.status(201).json({
      message: "User registered successfully.",
      data: { id: user.id }
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // check for empty fields
    if (!email || !password) {
      next(createError(400, { message: "Please enter the required fields." }));
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      next(createError(400, { message: "User does not exist." }));
      return;
    }

    // compare passwords
    if (await bcrypt.compare(password, user.password)) {
      // generate tokens & send responce
      res.status(200).json({
        message: "Logged in.",
        data: {
          accessToken: generateAccessToken(user.email, user.name, user.id)
        }
      });
      return;
    } else {
      next(createError(400, { message: "Incorrect password." }));
      return;
    }
  } catch (err) {
    next(err);
  }
};
