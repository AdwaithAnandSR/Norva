import express from "express";

import signIn from "../controllers/auth/signin.controller.js";
import signUp from "../controllers/auth/signup.controller.js";
import refreshTokens from "../controllers/auth/refreshTokens.controller.js";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/refreshTokens", refreshTokens);

export default router;
