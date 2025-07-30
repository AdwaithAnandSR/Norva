import { create } from "zustand";

import { getUser } from "../storage/storage.js";

const { userId, username, role, fullname } = getUser();

export const useUserStore = create((set, get) => ({
    username: username || "",
    userId: userId || "",
    role: role || "",
    fullname: fullname || "",
    setUsername: username => set({ username }),
    setUserId: userId => set({ userId }),
    setFullname: fullname => set({ fullname }),
    setRole: role => set({ role }),
    setAll: ({ username, fullname, role, userId }) =>
        set({ userId, username, role, fullname }),
    clearAll: () => set({ username: "", fullname: "", userId: "", role: "" }),
    isLoggedIn: ()=> !!get().userId
}));
