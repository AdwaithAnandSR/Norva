import User from "../../models/user.models.js";
import Post from "../../models/post.models.js";

export const getMyProfile = async (req, res) => {
    try {
        const myId = req.user.userId;

        const [user, postsCount] = await Promise.all([
            User.findById(myId)
                .select(
                    "fullname username profileImage backgroundImage followersCount followingCount"
                )
                .lean(),
            Post.countDocuments({ userId: myId })
        ]);

        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "USER_NOT_FOUND" });

        return res.status(200).json({
            success: true,
            user: { ...user, postsCount }
        });
    } catch (error) {
        console.error("getMyProfile error:", error);
        return res.status(500).json({ success: false });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = Number(req.query.limit ?? 12);
        const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : null;

        const query = {
            userId: id,
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

        const posts = await Post.find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1)
            .lean();

        const hasMore = posts.length > limit;
        if (hasMore) posts.pop();

        const nextCursor = hasMore
            ? { createdAt: posts.at(-1).createdAt, _id: posts.at(-1)._id }
            : null;

        return res
            .status(200)
            .json({ success: true, posts, nextCursor, hasMore });
    } catch (error) {
        console.error("getUserPosts error:", error);
        return res.status(500).json({ success: false });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { fullname, username, profileImage, backgroundImage } = req.body;

        if (
            !fullname?.trim() &&
            !username?.trim() &&
            profileImage === undefined &&
            backgroundImage === undefined
        )
            return res
                .status(400)
                .json({ success: false, message: "NOTHING_TO_UPDATE" });

        // Check username taken
        if (username) {
            const taken = await User.findOne({
                username: username.trim(),
                _id: { $ne: myId }
            });
            if (taken)
                return res
                    .status(409)
                    .json({ success: false, message: "USERNAME_TAKEN" });
        }

        const user = await User.findById(myId);
        if (fullname) user.fullname = fullname.trim();
        if (username) user.username = username.trim();
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (backgroundImage !== undefined)
            user.backgroundImage = backgroundImage;
        await user.save();

        return res.status(200).json({
            success: true,
            user: {
                fullname: user.fullname,
                username: user.username,
                profileImage: user.profileImage,
                backgroundImage: user.backgroundImage
            }
        });
    } catch (error) {
        console.error("updateProfile error:", error);
        return res.status(500).json({ success: false });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const targetId = req.params.id;
        const myId = req.user.userId;

        const [user, postsCount] = await Promise.all([
            User.findById(targetId)
                .select(
                    "fullname username profileImage backgroundImage followersCount followingCount followers"
                )
                .lean(),
            Post.countDocuments({ userId: targetId })
        ]);

        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "USER_NOT_FOUND" });

        return res.status(200).json({
            success: true,
            user: {
                ...user,
                postsCount,
                isFollowing: user.followers?.some(id => id.toString() === myId)
            }
        });
    } catch (error) {
        console.error("getUserProfile error:", error);
        return res.status(500).json({ success: false });
    }
};

export const updatePushToken = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { pushToken } = req.body;

        if (!pushToken)
            return res
                .status(400)
                .json({ success: false, message: "PUSH_TOKEN_REQUIRED" });

        const user = await User.findById(myId);
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "USER_NOT_FOUND" });

        user.expoPushToken = pushToken;
        if (!user.pushTokens) user.pushTokens = [];
        if (!user.pushTokens.includes(pushToken)) {
            user.pushTokens.push(pushToken);
        }
        await user.save();

        return res
            .status(200)
            .json({ success: true, message: "PUSH_TOKEN_UPDATED" });
    } catch (error) {
        console.error("[ProfileController] updatePushToken error:", error);
        return res.status(500).json({ success: false });
    }
};
