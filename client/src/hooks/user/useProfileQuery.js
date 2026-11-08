import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
    getMyProfile,
    getMyPosts,
    getProfile,
    getPosts
} from "../../controllers/user/profile.controller.js";

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

export const useUserProfile = id =>
    useQuery({
        queryKey: ["profile", id],
        queryFn: () => getProfile(id),
        staleTime: 1000 * 60 * 2
    });

export const useUserPosts = id =>
    useInfiniteQuery({
        queryKey: ["posts", id],
        queryFn: ({ pageParam }) => getPosts({ cursor: pageParam, id }),
        initialPageParam: null,
        getNextPageParam: page => (page.hasMore ? page.nextCursor : undefined)
    });
