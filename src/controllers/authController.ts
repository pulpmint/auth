import { Router } from "express";

import { login, register } from "../services/authServices";

// declare the router
const router = Router();

// routes
router.post("/register", (req, res) => register(req, res));
router.post("/login", (req, res) => login(req, res));

// export
export default router;
