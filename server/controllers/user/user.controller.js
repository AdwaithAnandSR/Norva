import User from "../../models/user.models.js";

export const getUserProfile = async (req, res) => {
    try {
        const targetId = req.params.id;
        const myId = req.user.userId;

        const user = await User.findById(targetId)
            .select("fullname username followersCount followingCount followers")
            .lean();

        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "USER_NOT_FOUND" });

        return res.status(200).json({
            success: true,
            user: {
                ...user,
                isFollowing: user.followers.some(id => id.toString() === myId)
            }
        });
    } catch (error) {
        console.error("getUserProfile error:", error);
        return res.status(500).json({ success: false });
    }
};
