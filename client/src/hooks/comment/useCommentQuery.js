import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchComments } from "../../controllers/post/comment.controller.js";

export const useCommentsQuery = (postId, enabled) => {
    return useInfiniteQuery({
        queryKey: ["comments", postId],

        queryFn: ({ pageParam }) =>
            fetchComments({
                postId,
                cursor: pageParam
            }),

        initialPageParam: null,

        getNextPageParam: page => (page.hasMore ? page.nextCursor : undefined),

        enabled
    });
};
