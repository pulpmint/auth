import { NextFunction, Request, Response, Router } from "express";
import { HttpError } from "http-errors";
import { login, register } from "../services/authServices";

// declare the router
const router = Router();

// routes
router.post("/register", (req, res, next) => register(req, res, next));
router.post("/login", (req, res, next) => login(req, res, next));

// auth error handler
router.use(
  (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.log({ ...err, status: err.status });

    // incoming vs default
    let message = err.message || "Something went wrong.";
    let status = err.status || 500;

    // special cases
    // prisma error - user does not exist
    if (err.code && err.code === "P2002") {
      status = 400;
      message = "User already exists.";
    }

    // remove message if status is 500
    if (status === 500) {
      message = "Something went wrong.";
    }

    res.status(status).json({ message });
  }
);

// export
export default router;
