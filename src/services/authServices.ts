import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { handleAuthErrors, validateEmailPassword } from "../utils/authUtils";
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
