import Comment from "../../models/comment.models.js";
import Post from "../../models/post.models.js";

export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const limit = Number(req.query.limit ?? 20);
        const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : null;

        const query = {
            postId,
            parentId: null,
            ...(cursor
                ? {
                      $or: [
                          { createdAt: { $lt: new Date(cursor.createdAt) } },
                          {
                              createdAt: new Date(cursor.createdAt),
                              _id: { $lt: cursor._id }
                          }
                      ]
                  }
                : {})
        };

        const comments = await Comment.find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1)
            .populate("userId", "username fullname")
            .lean();

        const hasMore = comments.length > limit;
        if (hasMore) comments.pop();

        const nextCursor = hasMore
            ? { createdAt: comments.at(-1).createdAt, _id: comments.at(-1)._id }
            : null;

        // Attach "liked by me" flag
        const myId = req.user.userId;
        const enriched = comments.map(c => ({
            ...c,
            likedByMe: c.likes?.some(id => id.toString() === myId) ?? false
        }));

        return res
            .status(200)
            .json({ success: true, comments: enriched, nextCursor, hasMore });
    } catch (error) {
        console.error("getComments error:", error);
        return res.status(500).json({ success: false });
    }
};

export const comment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentId = null } = req.body;

        if (!content?.trim()) {
            return res
                .status(400)
                .json({ success: false, message: "EMPTY_CONTENT" });
        }

        const [post, parent] = await Promise.all([
            Post.findById(postId),
            parentId ? Comment.findById(parentId) : null
        ]);

        if (!post)
            return res
                .status(404)
                .json({ success: false, message: "POST_NOT_FOUND" });
        if (parentId && !parent) {
            return res
                .status(404)
                .json({ success: false, message: "PARENT_NOT_FOUND" });
        }

        const comment = await Comment.create({
            postId,
            userId: req.user.userId,
            content: content.trim(),
            parentId: parentId ?? null
        });

        // Increment counters
        post.commentsCount += 1;
        await post.save();

        if (parent) {
            parent.repliesCount += 1;
            await parent.save();
        }

        // Return populated comment
        const populated = await comment.populate("userId", "username fullname");

        return res.status(201).json({ success: true, comment: populated });
    } catch (error) {
        console.error("createComment error:", error);
        return res.status(500).json({ success: false });
    }
};

export const likeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false });

        const userId = req.user.userId;
        const alreadyLiked = comment.likes.includes(userId);

        if (alreadyLiked) {
            comment.likes.pull(userId);
            comment.likesCount = Math.max(0, comment.likesCount - 1);
        } else {
            comment.likes.addToSet(userId);
            comment.likesCount += 1;
        }

        await comment.save();
        return res.status(200).json({
            success: true,
            liked: !alreadyLiked,
            likesCount: comment.likesCount
        });
    } catch (error) {
        console.error("likeComment error:", error);
        return res.status(500).json({ success: false });
    }
};

export const replies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const limit = Number(req.query.limit ?? 10);
        const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : null;

        const query = {
            parentId: commentId,
            ...(cursor
                ? {
                      $or: [
                          { createdAt: { $gt: new Date(cursor.createdAt) } },
                          {
                              createdAt: new Date(cursor.createdAt),
                              _id: { $gt: cursor._id }
                          }
                      ]
                  }
                : {})
        };

        const replies = await Comment.find(query)
            .sort({ createdAt: 1, _id: 1 }) // oldest first for replies
            .limit(limit + 1)
            .populate("userId", "username fullname")
            .lean();

        const hasMore = replies.length > limit;
        if (hasMore) replies.pop();

        const nextCursor = hasMore
            ? { createdAt: replies.at(-1).createdAt, _id: replies.at(-1)._id }
            : null;

        const myId = req.user.userId;
        const enriched = replies.map(r => ({
            ...r,
            likedByMe: r.likes?.some(id => id.toString() === myId) ?? false
        }));

        return res
            .status(200)
            .json({ success: true, replies: enriched, nextCursor, hasMore });
    } catch (error) {
        console.error("getReplies error:", error);
        return res.status(500).json({ success: false });
    }
};
