import User from "../../models/user.models.js";

export const followUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const myId = req.user.userId;

        if (targetId === myId)
            return res.status(400).json({ success: false, message: "CANNOT_FOLLOW_SELF" });

        const [me, target] = await Promise.all([
            User.findById(myId),
            User.findById(targetId)
        ]);

        if (!me)
            return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });

        if (!target)
            return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });

        const alreadyFollowing = me.following.some(id => id.toString() === targetId);
        if (alreadyFollowing) {
            return res.status(200).json({
                success: true,
                isFollowing: true,
                followersCount: target.followersCount
            });
        }

        me.following.addToSet(targetId);
        me.followingCount = me.following.length;

        target.followers.addToSet(myId);
        target.followersCount = target.followers.length;

        await Promise.all([me.save(), target.save()]);

        return res.status(200).json({
            success: true,
            isFollowing: true,
            followersCount: target.followersCount
        });
    } catch (error) {
        console.error("followUser error:", error);
        return res.status(500).json({ success: false });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const myId = req.user.userId;

        const [me, target] = await Promise.all([
            User.findById(myId),
            User.findById(targetId)
        ]);

        if (!me)
            return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });

        if (!target)
            return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });

        const alreadyFollowing = me.following.some(id => id.toString() === targetId);
        if (!alreadyFollowing) {
            return res.status(200).json({
                success: true,
                isFollowing: false,
                followersCount: target.followersCount
            });
        }

        me.following.pull(targetId);
        me.followingCount = me.following.length;

        target.followers.pull(myId);
        target.followersCount = target.followers.length;

        await Promise.all([me.save(), target.save()]);

        return res.status(200).json({
            success: true,
            isFollowing: false,
            followersCount: target.followersCount
        });
    } catch (error) {
        console.error("unfollowUser error:", error);
        return res.status(500).json({ success: false });
    }
};