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

            setUsername: username => set({ username }),
            setUserId: userId => set({ userId }),
            setFullname: fullname => set({ fullname }),
            setRole: role => set({ role }),

            updateUser: ({ username, fullname, role, userId }) =>
                set({ userId, username, role, fullname }),

            clearAll: () => {
                alert("clearing ");

                set({ username: "", fullname: "", userId: "", role: "" });
            },
            isLoggedIn: () => !!get().userId
        }),
        {
            name: "user-storage",
            storage: zustandStorage
        }
    )
);
