import User from "../../models/user.models.js";

const RECENT_SEARCH_LIMIT = 15;
const SEARCH_RESULT_LIMIT = 20;

// Escape user input before dropping it into a RegExp
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /user/search?q=<term>
export const searchUsers = async (req, res) => {
    try {
        const myId = req.user.userId;
        const q = (req.query.q ?? "").trim();

        if (!q) {
            return res.status(200).json({ success: true, users: [] });
        }

        const safe = escapeRegex(q);
        const startsWith = new RegExp(`^${safe}`, "i");
        const contains = new RegExp(safe, "i");

        const [me, matches] = await Promise.all([
            User.findById(myId).select("following").lean(),
            User.find({
                _id: { $ne: myId },
                $or: [{ username: contains }, { fullname: contains }]
            })
                .select("username fullname followersCount")
                .limit(SEARCH_RESULT_LIMIT * 2) // over-fetch, then rank client-side of this query
                .lean()
        ]);

        const followingSet = new Set(
            (me?.following ?? []).map(id => id.toString())
        );

        // Rank: username/fullname starting with the query first, then by follower count
        const ranked = matches
            .map(u => ({
                ...u,
                isFollowing: followingSet.has(u._id.toString()),
                _rank:
                    startsWith.test(u.username) ||
                    startsWith.test(u.fullname ?? "")
                        ? 1
                        : 0
            }))
            .sort(
                (a, b) =>
                    b._rank - a._rank || b.followersCount - a.followersCount
            )
            .slice(0, SEARCH_RESULT_LIMIT)
            .map(({ _rank, ...u }) => u);

        return res.status(200).json({ success: true, users: ranked });
    } catch (error) {
        console.error("searchUsers error:", error);
        return res.status(500).json({ success: false });
    }
};

// GET /user/search/recent
export const getRecentSearches = async (req, res) => {
    try {
        const myId = req.user.userId;

        const me = await User.findById(myId)
            .select("recentSearches")
            .populate({
                path: "recentSearches.user",
                select: "username fullname followersCount"
            })
            .lean();

        if (!me)
            return res
                .status(404)
                .json({ success: false, message: "USER_NOT_FOUND" });

        const users = (me.recentSearches ?? [])
            .filter(entry => entry.user) // drop entries whose target user was deleted
            .sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt))
            .map(entry => ({ ...entry.user, searchedAt: entry.searchedAt }));

        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("getRecentSearches error:", error);
        return res.status(500).json({ success: false });
    }
};

// POST /user/search/recent/:id
export const addRecentSearch = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { id: targetId } = req.params;

        if (targetId === myId) {
            return res.status(200).json({ success: true });
        }

        const target = await User.exists({ _id: targetId });
        if (!target)
            return res
                .status(404)
                .json({ success: false, message: "USER_NOT_FOUND" });

        // Remove any existing entry for this user, then push it to the front
        await User.updateOne(
            { _id: myId },
            { $pull: { recentSearches: { user: targetId } } }
        );

        await User.updateOne(
            { _id: myId },
            {
                $push: {
                    recentSearches: {
                        $each: [{ user: targetId, searchedAt: new Date() }],
                        $position: 0,
                        $slice: RECENT_SEARCH_LIMIT
                    }
                }
            }
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("addRecentSearch error:", error);
        return res.status(500).json({ success: false });
    }
};

// DELETE /user/search/recent/:id
export const removeRecentSearch = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { id: targetId } = req.params;

        await User.updateOne(
            { _id: myId },
            { $pull: { recentSearches: { user: targetId } } }
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("removeRecentSearch error:", error);
        return res.status(500).json({ success: false });
    }
};

// DELETE /user/search/recent
export const clearRecentSearches = async (req, res) => {
    try {
        const myId = req.user.userId;

        await User.updateOne({ _id: myId }, { $set: { recentSearches: [] } });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("clearRecentSearches error:", error);
        return res.status(500).json({ success: false });
    }
};
