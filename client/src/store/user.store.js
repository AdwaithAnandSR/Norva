import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage } from "../storage/storage.js";

export const useUser = create(
    persist(
        (set, get) => ({
            username: "",
            userId: "",
            role: "",
            fullname: "",
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,

            setUsername:      username      => set({ username }),
            setUserId:        userId        => set({ userId }),
            setFullname:      fullname      => set({ fullname }),
            setRole:          role          => set({ role }),

            updateUser: ({ username, fullname, role, userId }) =>
                set({ userId, username, role, fullname }),

            updateProfile: ({ fullname, username }) =>
                set({ fullname, username }),

            updateStats: ({ followersCount, followingCount, postsCount }) =>
                set({ followersCount, followingCount, postsCount }),

            incrementFollowing: () =>
                set(s => ({ followingCount: s.followingCount + 1 })),

            decrementFollowing: () =>
                set(s => ({ followingCount: Math.max(0, s.followingCount - 1) })),

            clearAll: () =>
                set({
                    username: "", fullname: "", userId: "", role: "",
                    followersCount: 0, followingCount: 0, postsCount: 0
                }),

            isLoggedIn: () => !!get().userId
        }),
        {
            name: "user-storage",
            storage: zustandStorage
        }
    )
);