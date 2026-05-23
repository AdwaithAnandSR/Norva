import express from "express";

const router = express.Router();

import User from "../models/user.models.js";
import Post from "../models/post.models.js";

import { like, dislike } from "../controllers/feed/like.js";
import { createFeed, getFeed } from "../controllers/feed/feed.js";
import {
    getComments,
    comment,
    likeComment,
    replies
} from "../controllers/feed/comment.js";

router.post("/getFeed", getFeed);

router.post("/create", createFeed);

router.post("/like/:id", like);

router.delete("/like/:id", dislike);

router.get("/:postId/comments", getComments);

router.post("/:postId/comments", comment);

router.post("/comment/:commentId/like", likeComment);

router.get("/comment/:commentId/replies", replies);

export default router;
