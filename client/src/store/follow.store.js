import { create } from "zustand";

export const useFollowStore = create(set => ({
    // { [userId]: boolean }
    states: {},

    setFollowing: (userId, isFollowing) =>
        set(s => ({ states: { ...s.states, [userId]: isFollowing } })),

    seedFromPosts: posts =>
        set(s => {
            const next = { ...s.states };
            posts.forEach(p => {
                const uid = p.userId?._id ?? p.userId;
                if (uid && p.isFollowing !== undefined) {
                    next[uid] = p.isFollowing;
                }
            });
            return { states: next };
        })
}));
