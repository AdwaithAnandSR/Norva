import Comment from "../../models/comment.models.js";
import Post from "../../models/post.models.js";
import { sendCommentNotification } from "../../services/notification.service.js";

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
            .populate("userId", "username fullname profileImage")
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
        const populated = await comment.populate("userId", "username fullname profileImage");

        const commenterName = populated.userId?.fullname || populated.userId?.username;
        const myId = req.user.userId;

        // Send push notification to post author if not self
        if (post.userId && post.userId.toString() !== myId) {
            sendCommentNotification({
                recipientId: post.userId,
                commenterName,
                commentText: content,
                postId,
                commentId: comment._id
            }).catch(err => console.error("Comment push notification error:", err));
        }

        // Send push notification to parent comment author if replying to a comment and parent author is different from post author & commenter
        if (parent && parent.userId && parent.userId.toString() !== myId && parent.userId.toString() !== post.userId?.toString()) {
            sendCommentNotification({
                recipientId: parent.userId,
                commenterName,
                commentText: content,
                postId,
                commentId: comment._id
            }).catch(err => console.error("Reply push notification error:", err));
        }

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
            .populate("userId", "username fullname profileImage")
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

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const myId = req.user.userId;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res
                .status(404)
                .json({ success: false, message: "COMMENT_NOT_FOUND" });
        }

        // Authorization check: Only the comment author can delete
        if (comment.userId.toString() !== myId) {
            return res
                .status(403)
                .json({ success: false, message: "UNAUTHORIZED" });
        }

        const { postId, parentId } = comment;

        if (parentId) {
            await Comment.findByIdAndDelete(commentId);

            // Decrement parent comment's repliesCount atomically
            await Comment.findByIdAndUpdate(parentId, {
                $inc: { repliesCount: -1 }
            });

            // Decrement post's total commentsCount atomically
            await Post.findByIdAndUpdate(postId, {
                $inc: { commentsCount: -1 }
            });
        } else {
            // 1. Cascade delete all nested replies attached to this comment
            const replyDeletion = await Comment.deleteMany({
                parentId: commentId
            });
            const deletedRepliesCount = replyDeletion.deletedCount || 0;

            // 2. Delete the main comment itself
            await Comment.findByIdAndDelete(commentId);

            // 3. Decrement post total commentsCount by (1 comment + all deleted replies)
            const totalRemoved = 1 + deletedRepliesCount;
            await Post.findByIdAndUpdate(postId, {
                $inc: { commentsCount: -totalRemoved }
            });
        }

        return res.status(200).json({
            success: true,
            message: "COMMENT_DELETED"
        });
    } catch (error) {
        console.error("deleteComment error:", error);
        return res.status(500).json({ success: false });
    }
};
