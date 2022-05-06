import { Router } from "express";

import { register } from "../services/authServices";

// declare the router
const router = Router();

// routes
router.post("/register", (req, res) => register(req, res));

// export
export default router;
