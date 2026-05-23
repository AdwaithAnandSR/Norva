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
