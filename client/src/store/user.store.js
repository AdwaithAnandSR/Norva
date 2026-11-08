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
            profileImage: "",
            backgroundImage: "",
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,

            setUsername:        username        => set({ username }),
            setUserId:          userId          => set({ userId }),
            setFullname:        fullname        => set({ fullname }),
            setRole:            role            => set({ role }),
            setProfileImage:    profileImage    => set({ profileImage }),
            setBackgroundImage: backgroundImage => set({ backgroundImage }),

            updateUser: ({ username, fullname, role, userId, profileImage, backgroundImage }) =>
                set(s => ({
                    userId: userId ?? s.userId,
                    username: username ?? s.username,
                    role: role ?? s.role,
                    fullname: fullname ?? s.fullname,
                    profileImage: profileImage ?? s.profileImage,
                    backgroundImage: backgroundImage ?? s.backgroundImage
                })),

            updateProfile: ({ fullname, username, profileImage, backgroundImage }) =>
                set(s => ({
                    ...(fullname !== undefined && { fullname }),
                    ...(username !== undefined && { username }),
                    ...(profileImage !== undefined && { profileImage }),
                    ...(backgroundImage !== undefined && { backgroundImage })
                })),

            updateStats: ({ followersCount, followingCount, postsCount }) =>
                set({ followersCount, followingCount, postsCount }),

            incrementFollowing: () =>
                set(s => ({ followingCount: s.followingCount + 1 })),

            decrementFollowing: () =>
                set(s => ({ followingCount: Math.max(0, s.followingCount - 1) })),

            clearAll: () =>
                set({
                    username: "", fullname: "", userId: "", role: "",
                    profileImage: "", backgroundImage: "",
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