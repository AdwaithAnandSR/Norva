import express from "express";

const router = express.Router();

import User from "../models/user.models.js";
import Token from "../models/token.model.js";

import { isAuthenticated } from "../security/secure.js";

router.post("/getRandomPosts", isAuthenticated, (req, res) => {
    console.log("getting posts ..");
    res.json({
        posts: ["post1", "post2", "post3", "post4"]
    });
});


export default router;
