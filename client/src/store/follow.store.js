import { create } from "zustand";

export const useFollowStore = create(set => ({
    states: {},
    pending: {},

    setFollowing: (userId, isFollowing) =>
        set(s => ({ states: { ...s.states, [userId]: isFollowing } })),

    setPending: (userId, val) =>
        set(s => ({ pending: { ...s.pending, [userId]: val } })),

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