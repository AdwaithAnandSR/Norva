import express from "express";

const router = express.Router();

import User from "../models/user.models.js";
import Post from "../models/post.models.js";

import { like, dislike } from "../controllers/feed/like.js";
import {
    createFeed,
    getFeed,
    deletePost,
    editPost,
    incrementViews
} from "../controllers/feed/feed.js";
import {
    getComments,
    comment,
    likeComment,
    replies, deleteComment
} from "../controllers/feed/comment.js";

router.post("/create", createFeed);
router.post("/getFeed", getFeed);
router.delete("/:id", deletePost);
router.patch("/:id", editPost);
router.post("/:id/view", incrementViews);

router.post("/like/:id", like);

router.delete("/like/:id", dislike);

router.get("/:postId/comments", getComments);

router.post("/:postId/comments", comment);

router.post("/comment/:commentId/like", likeComment);

router.get("/comment/:commentId/replies", replies);

router.delete("/comment/:commentId", deleteComment);

export default router;
