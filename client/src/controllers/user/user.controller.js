import api from "../../utils/axios.js";

export const followUser = async userId => {
    const { data } = await api.post(`/user/${userId}/follow`);
    return data; // { success, isFollowing, followersCount }
};

export const unfollowUser = async userId => {
    const { data } = await api.delete(`/user/${userId}/follow`);
    return data; // { success, isFollowing, followersCount }
};

export const getUserProfile = async userId => {
    const { data } = await api.get(`/user/${userId}`);
    return data; // { success, user }
};

export const getFollowers = async userId => {
    const { data } = await api.get(`/user/${userId}/followers`);
    return data; // { success, users }
};

export const getFollowing = async userId => {
    const { data } = await api.get(`/user/${userId}/following`);
    return data; // { success, users }
};

export const updatePushTokenApi = async pushToken => {
    const { data } = await api.post("/user/push-token", { pushToken });
    return data; // { success, message }
};
