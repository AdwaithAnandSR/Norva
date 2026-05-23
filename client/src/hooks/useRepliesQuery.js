import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchReplies } from "../controllers/post/comment.controller.js";

export const useRepliesQuery = (commentId, enabled) => {
    return useInfiniteQuery({
        queryKey: ["replies", commentId],

        queryFn: ({ pageParam }) =>
            fetchReplies({
                commentId,
                cursor: pageParam
            }),

        initialPageParam: null,

        getNextPageParam: page => (page.hasMore ? page.nextCursor : undefined),

        enabled
    });
};
