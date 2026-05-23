import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getMyProfile, getMyPosts } from "../../controllers/user/profile.controller.js";

export const useMyProfile = () =>
    useQuery({
        queryKey: ["profile", "me"],
        queryFn: getMyProfile,
        staleTime: 1000 * 60 * 2
    });

export const useMyPosts = () =>
    useInfiniteQuery({
        queryKey: ["posts", "me"],
        queryFn: ({ pageParam }) => getMyPosts({ cursor: pageParam }),
        initialPageParam: null,
        getNextPageParam: page => (page.hasMore ? page.nextCursor : undefined)
    });