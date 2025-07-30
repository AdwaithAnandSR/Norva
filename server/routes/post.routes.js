import express from "express";

const router = express.Router();

import { isAuthenticated } from "../security/secure.js"

router.post("/getRandomPosts", isAuthenticated, (req, res) => {
    console.log("getting posts ..");
    res.json({
        posts: ["post1", "post2", "post3", "post4"]
    });
});

export default router;
