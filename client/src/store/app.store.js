import { create } from "zustand";

export const useApp = create(set => ({
    toast: "",
    muted: false,

    setToast: toast => set({ toast }),
    toggleMuted: () => set(s => ({ muted: !s.muted }))
}));
