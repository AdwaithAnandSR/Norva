import { create } from "zustand";

export const useComments = create(set => ({
    postId: null,
    visible: false,

    onOpen: postId => set({ postId, visible: true }),
    onClose: () => set({ visible: false }),

    onCommentAdded: null,
    setOnCommentAdded: fn => set({ onCommentAdded: fn })
}));
