import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {
  generateAccessToken,
  handleAuthErrors,
  validateEmailPassword
} from "../utils/authUtils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// register user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // check for empty fields
    if (!email || !password || !name) {
      res.status(400).json({ msg: "Please enter the required fields." });
      return;
    }

    // validations
    const isEmailPassword = validateEmailPassword(email, password);

    if (!isEmailPassword.success) {
      res.status(400).json({ msg: isEmailPassword.msg });
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
      msg: "User registered successfully.",
      data: { id: user.id }
    });
    return;
  } catch (err) {
    res.status(500).json({ msg: handleAuthErrors(err) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // check for empty fields
    if (!email || !password) {
      res.status(400).json({ msg: "Please enter the required fields." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(400).json({ msg: "User does not exist." });
      return;
    }

    // compare passwords
    if (await bcrypt.compare(password, user.password)) {
      // generate tokens
      const accessToken = generateAccessToken(user.email, user.name, user.id);
      res.status(200).json({ msg: "Logged in.", data: { accessToken } });
      return;
    } else {
      res.status(400).json({ msg: "Incorrect password." });
      return;
    }
  } catch (err) {
    res.status(500).json({ msg: handleAuthErrors(err) });
  }
};
