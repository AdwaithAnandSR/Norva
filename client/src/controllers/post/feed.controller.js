import api from "../../utils/axios.js";

import { useApp } from "../../store/app.store.js";

const setToast = useApp.getState().setToast;

export const createPost = async ({
    title,
    description,
    tags,
    media,
    imageDetails
}) => {
    try {
        const { data } = await api.post("/post/create", {
            title,
            description,
            tags,
            ...media,
            height: imageDetails?.height ?? -1,
            width: imageDetails?.width ?? -1
        });

        setToast("green=>Created");

        return true;
    } catch (error) {
        setToast("red=>Failed");
        console.log(error);

        return false;
    }
};

export const fetchFeed = async ({ cursor = null, limit = 10 } = {}) => {
    const { data } = await api.post("/post/getFeed", {
        cursor,
        limit
    });
    return data; // { success, posts, nextCursor, hasMore }
};

export const deletePost = async postId => {
    try {
        const { data } = await api.delete(`/post/${postId}`);

        setToast("green=>Deleted");
        return data; // { success }
    } catch (e) {
        setToast("red=>Failed");
        console.log(e);

        return { success: false };
    }
};

export const editPost = async (postId, { title, description, tags }) => {
    try {
        const { data } = await api.patch(`/post/${postId}`, {
            title,
            description,
            tags
        });
        setToast("green=>Edited");
        return data; // { success, post }
    } catch (e) {
        setToast("red=>Failed");
        console.log(e);

        return { success: false };
    }
};

export const incrementView = async postId => {
    await api.post(`/post/${postId}/view`);
};

export const setLike = async (postId, shouldLike) => {
    const response = shouldLike
        ? await api.post(`/post/like/${postId}`)
        : await api.delete(`/post/like/${postId}`);

    return response.data;
};
