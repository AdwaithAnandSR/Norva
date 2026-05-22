import express from "express";

const router = express.Router();

import User from "../models/user.models.js";
import Post from "../models/post.models.js";

router.post("/getRandomPosts", (req, res) => {
    console.log("getting posts ..");
    res.json({
        posts: ["post1", "post2", "post3", "post4"]
    });
});

router.post("/create", async (req, res) => {
    try {
        const { title, description, tags, mediaType, url, mediaPublicId } =
            req.body;

        const post = await Post.create({
            title,
            description,
            tags,
            mediaType,
            url,
            mediaPublicId,
            userId: req.user.userId
        });

        res.status(200).json({
            success: true,
            post
        });
    } catch (error) {
        console.log("Error while creating post: ", error);

        res.status(500).json({
            success: false
        });
    }
});

export default router;
