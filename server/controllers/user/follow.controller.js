import User from "../../models/user.models.js";
import { sendFollowNotification } from "../../services/notification.service.js";
import { emitToUser } from "../../services/socket.service.js";

export const followUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const myId = req.user.userId;

        console.log(`[FollowController] followUser requested: sender=${myId} -> target=${targetId}`);

        if (targetId === myId) {
            console.log(`[FollowController] Rejected: User ${myId} attempted to follow self`);
            return res.status(400).json({ success: false, message: "CANNOT_FOLLOW_SELF" });
        }

        const [me, target] = await Promise.all([
            User.findById(myId),
            User.findById(targetId)
        ]);

        if (!me) {
            console.log(`[FollowController] Failed: Sender user ${myId} not found`);
            return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });
        }

        if (!target) {
            console.log(`[FollowController] Failed: Target user ${targetId} not found`);
            return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });
        }

        const alreadyFollowing = me.following.some(id => id.toString() === targetId);
        console.log(`[FollowController] alreadyFollowing check for ${myId} -> ${targetId}: ${alreadyFollowing}`);

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

        console.log(`[FollowController] DB updated: User ${me.username} (${myId}) is now following User ${target.username} (${targetId})`);

        // Emit real-time socket event if connected
        try {
            emitToUser(targetId, "follow_notification", {
                type: "follow",
                followerId: myId,
                followerName: me.fullname || me.username
            });
            console.log(`[FollowController] Socket follow_notification emitted to user:${targetId}`);
        } catch (socketErr) {
            console.error("[FollowController] Socket emission error:", socketErr);
        }

        // Trigger Expo push notification
        console.log(`[FollowController] Triggering sendFollowNotification for recipientId: ${targetId}`);
        sendFollowNotification({
            recipientId: targetId,
            followerName: me.fullname || me.username,
            followerId: myId
        })
            .then(() => console.log(`[FollowController] sendFollowNotification promise resolved for targetId: ${targetId}`))
            .catch(err => console.error("[FollowController] Follow notification error:", err));

        return res.status(200).json({
            success: true,
            isFollowing: true,
            followersCount: target.followersCount
        });
    } catch (error) {
        console.error("[FollowController] followUser error:", error);
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

export const getFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const myId = req.user.userId;

        const [user, me] = await Promise.all([
            User.findById(id)
                .select("followers")
                .populate("followers", "username fullname profileImage followersCount")
                .lean(),
            User.findById(myId).select("following").lean()
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });
        }

        const myFollowingSet = new Set(
            (me?.following ?? []).map(fId => fId.toString())
        );

        const followers = (user.followers ?? []).map(u => ({
            _id: u._id,
            username: u.username,
            fullname: u.fullname,
            profileImage: u.profileImage ?? "",
            followersCount: u.followersCount ?? 0,
            isFollowing: myFollowingSet.has(u._id.toString())
        }));

        return res.status(200).json({ success: true, users: followers });
    } catch (error) {
        console.error("getFollowers error:", error);
        return res.status(500).json({ success: false, message: "SERVER_ERROR" });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const { id } = req.params;
        const myId = req.user.userId;

        const [user, me] = await Promise.all([
            User.findById(id)
                .select("following")
                .populate("following", "username fullname profileImage followersCount")
                .lean(),
            User.findById(myId).select("following").lean()
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });
        }

        const myFollowingSet = new Set(
            (me?.following ?? []).map(fId => fId.toString())
        );

        const following = (user.following ?? []).map(u => ({
            _id: u._id,
            username: u.username,
            fullname: u.fullname,
            profileImage: u.profileImage ?? "",
            followersCount: u.followersCount ?? 0,
            isFollowing: myFollowingSet.has(u._id.toString())
        }));

        return res.status(200).json({ success: true, users: following });
    } catch (error) {
        console.error("getFollowing error:", error);
        return res.status(500).json({ success: false, message: "SERVER_ERROR" });
    }
};