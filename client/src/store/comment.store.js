import { create } from "zustand";

export const useComments = create((set, get) => ({
    postId: null,
    commentsCount: 0,
    visible: false,

    onOpen: postId => set({ postId, visible: true }),
    onClose: () => set({ visible: false }),
    onCommentAdded: () => set({ commentsCount: get().commentsCount + 1 }),

    setPostId: postId => set({ postId }),
    setCommentsCount: commentsCount => set({ commentsCount })
}));
