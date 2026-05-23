import Post from "../../models/post.models.js";
import Comment from "../../models/comment.models.js";
import User from "../../models/user.models.js";

import { deleteAsset } from "../../utils/cloudinary.js";

export const getFeed = async (req, res) => {
    try {
        const limit = Number(req.query.limit ?? 10);
        const { cursor } = req.body;

        const query = cursor
            ? {
                  $or: [
                      { createdAt: { $lt: new Date(cursor.createdAt) } },
                      {
                          createdAt: new Date(cursor.createdAt),
                          _id: { $lt: cursor._id }
                      }
                  ]
              }
            : {};

        const posts = await Post.find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1)
            .populate("userId", "username fullname")
            .lean();

        const hasMore = posts.length > limit;

        if (hasMore) posts.pop();

        const nextCursor = hasMore
            ? {
                  createdAt: posts.at(-1)?.createdAt,
                  _id: posts.at(-1)?._id
              }
            : null;

        const myId = req.user.userId;

        const me = await User.findById(myId).select("following").lean();

        const followingSet = new Set(
            (me?.following ?? []).map(id => id.toString())
        );

        const enriched = posts.map(p => ({
            ...p,
            isFollowing: followingSet.has(p.userId?._id?.toString())
        }));

        return res.status(200).json({
            success: true,
            posts: enriched,
            nextCursor,
            hasMore
        });
    } catch (error) {
        console.error("getFeed error:", error);

        return res.status(500).json({
            success: false
        });
    }
};

export const createFeed = async (req, res) => {
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
        console.error("Error while creating post:", error);
        res.status(500).json({
            success: false
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const post = await Post.findById(id);
        if (!post)
            return res
                .status(404)
                .json({ success: false, message: "POST_NOT_FOUND" });

        if (post.userId.toString() !== userId)
            return res
                .status(403)
                .json({ success: false, message: "FORBIDDEN" });

        if (post.mediaPublicId) await deleteAsset(post.mediaPublicId);

        await Promise.all([
            Post.findByIdAndDelete(id),
            Comment.deleteMany({ postId: id })
        ]);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("deletePost error:", error);
        return res.status(500).json({ success: false });
    }
};

export const editPost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { title, description, tags } = req.body;

        const post = await Post.findById(id);
        if (!post)
            return res
                .status(404)
                .json({ success: false, message: "POST_NOT_FOUND" });

        if (post.userId.toString() !== userId)
            return res
                .status(403)
                .json({ success: false, message: "FORBIDDEN" });

        if (title !== undefined) post.title = title.trim();
        if (description !== undefined) post.description = description.trim();
        if (tags !== undefined)
            post.tags = tags.map(t => t.trim().toLowerCase()).filter(Boolean);
        post.isEdited = true;

        await post.save();

        return res.status(200).json({ success: true, post });
    } catch (error) {
        console.error("editPost error:", error);
        return res.status(500).json({ success: false });
    }
};

export const incrementViews = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await Post.updateOne(
            {
                _id: id,
                views: { $ne: userId }
            },
            {
                $addToSet: { views: userId },
                $inc: { viewsCount: 1 }
            }
        );

        return res.status(200).json({
            success: true,
            counted: result.modifiedCount > 0
        });
    } catch (error) {
        console.error("incrementViews error:", error);
        return res.status(500).json({ success: false });
    }
};
