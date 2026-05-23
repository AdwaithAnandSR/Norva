import { create } from "zustand";

export const useComments = create(set => ({
    postId: null,
    visible: false,
    onCommentAdded: null,

    onOpen: postId => set({ postId, visible: true }),
    onClose: () => set({ visible: false }),
    setOnCommentAdded: fn => set({ onCommentAdded: fn })
}));
