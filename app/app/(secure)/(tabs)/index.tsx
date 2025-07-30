import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { storage } from "../../../storage/storage.js";
import { useUserStore } from "@store/user.store.js";
import api from "@utils/secureApi.js";

const fetchPosts = async () => {
    console.log("req data...");
    const res = await api.post(`/post/getRandomPosts`);
    return res.data;
};

const Home = () => {
    const logoutUser = useUserStore(state => state.clearAll);
    const { data, isLoading, error } = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts
    });

    if (isLoading) return <Text>loading....</Text>;

    if (error) {
        if (error.response?.status === 401) logoutUser();
        return <Text>{error?.response?.data?.message || error.message}</Text>;
    }

    return (
        <View style={styles.container}>
            {data?.posts?.map(item => <Text key={item}>{item}</Text>)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});

export default Home;
