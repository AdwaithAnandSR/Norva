import express from "express";

import signIn from "../controllers/auth/signin.controller.js";
import signUp from "../controllers/auth/signup.controller.js";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);

export default router;
