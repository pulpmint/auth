import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { AUTH_TOKEN_ACCESS, AUTH_TOKEN_REFRESH } from "../constants/headers";
import Prisma from "../lib/Prisma";
import Redis from "../lib/Redis";
import { validateEmailPassword } from "../utils/authUtils";
import {
  decodeToken,
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwtUtils";

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
    const user = await Prisma.user.create({
      data: { email, password: hashPassword, name }
    });

    // generate tokens & send response
    res.status(201).json({
      message: "User registered successfully.",
      data: {
        id: user.id,
        accessToken: generateAccessToken(user.email, user.name, user.id),
        refreshToken: generateRefreshToken(user.id)
      }
    });
    return;
  } catch (err) {
    next(err);
  }
};

// login user
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

    const user = await Prisma.user.findUnique({ where: { email } });

    if (!user) {
      next(createError(400, { message: "User does not exist." }));
      return;
    }

    // compare passwords
    if (await bcrypt.compare(password, user.password)) {
      // generate tokens & send response
      res.status(200).json({
        message: "Successfully logged in.",
        data: {
          accessToken: generateAccessToken(user.email, user.name, user.id),
          refreshToken: generateRefreshToken(user.id)
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

// refresh tokens
export const refreshTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    const payload = res.locals.payload as JwtPayload;
    const userID = payload.aud as string;

    // find user
    const user = await Prisma.user.findUnique({ where: { id: userID } });

    if (!user) {
      next(createError(403, { message: "Invalid refresh token." }));
      return;
    }

    // black list refresh token
    await Redis.set(authorization!, userID, { EXAT: payload.exp });

    // generate tokens & send response
    res.status(200).json({
      message: "Tokens refreshed.",
      data: {
        accessToken: generateAccessToken(user.email, user.name, user.id),
        refreshToken: generateRefreshToken(user.id)
      }
    });
  } catch (err) {
    next(err);
  }
};

// logout
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const aToken = req.headers[AUTH_TOKEN_ACCESS] as string;
    const rToken = req.headers[AUTH_TOKEN_REFRESH] as string;

    // check for missing tokens
    if (!aToken || !rToken) {
      next(createError(401, { message: "Missing access or refresh token." }));
      return;
    }

    // decode the tokens
    const [aDecoded, rDecoded] = await Promise.all([
      decodeToken(aToken, process.env.JWT_ACCESS_KEY!),
      decodeToken(rToken, process.env.JWT_REFRESH_KEY!)
    ]);

    // verify & add the to redis
    if (!aDecoded || !rDecoded) {
      next(createError(403, { message: "Invalid access or refresh token." }));
    } else {
      await Promise.all([
        Redis.set(aToken, aDecoded.aud as string, { EXAT: aDecoded.exp }),
        Redis.set(rToken, rDecoded.aud as string, { EXAT: rDecoded.exp })
      ]);

      res.status(200).json({ msg: "Successfully logged out." });
    }
  } catch (err) {
    next(err);
  }
};
