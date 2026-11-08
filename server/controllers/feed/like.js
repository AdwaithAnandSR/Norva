import Post from "../../models/post.models.js";
import User from "../../models/user.models.js";
import { sendLikeNotification } from "../../services/notification.service.js";

export const like = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false
            });
        }

        const alreadyLiked = post.likes.includes(userId);

        // already liked
        if (alreadyLiked) {
            return res.status(200).json({
                success: true,
                liked: true,
                likesCount: post.likesCount,
                alreadyInState: true
            });
        }

        post.likes.addToSet(userId);
        post.likesCount += 1;

        await post.save();

        if (post.userId && post.userId.toString() !== userId) {
            User.findById(userId)
                .select("username fullname")
                .lean()
                .then(liker => {
                    if (liker) {
                        sendLikeNotification({
                            recipientId: post.userId,
                            likerName: liker.fullname || liker.username,
                            postId: id
                        }).catch(err => console.error("Like notification error:", err));
                    }
                })
                .catch(err => console.error("Fetch liker error:", err));
        }

        return res.status(200).json({
            success: true,
            liked: true,
            likesCount: post.likesCount
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false
        });
    }
};

export const dislike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false
            });
        }

        const alreadyLiked = post.likes.includes(userId);

        // already unliked
        if (!alreadyLiked) {
            return res.status(200).json({
                success: true,
                liked: false,
                likesCount: post.likesCount,
                alreadyInState: true
            });
        }

        post.likes.pull(userId);

        post.likesCount = Math.max(0, post.likesCount - 1);

        await post.save();

        return res.status(200).json({
            success: true,
            liked: false,
            likesCount: post.likesCount
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false
        });
    }
};
