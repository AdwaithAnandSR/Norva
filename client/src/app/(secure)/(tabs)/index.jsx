import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { useResolveClassNames } from "uniwind";

import Header from "../../../components/common/HomeHeader.jsx"

const Home = () => {
    const { backgroundColor: gradientFrom, color: gradientTo } = useResolveClassNames(
        "bg-card text-primary"
    );
    return (
        <LinearGradient
            style={styles.container}
            colors={[gradientFrom, gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.25 }}
            className='pt-16'
        >
        <Header />
        
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default Home;
