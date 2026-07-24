import { create } from "zustand";

export const useApp = create(set => ({
    toast: "",

    setToast: toast => set({ toast })
}));
