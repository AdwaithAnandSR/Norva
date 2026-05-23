import React from "react";
import { View, Text } from "react-native";

const Home = () => {
    return (
        <View className="w-full px-3 flex-row items-center absolute z-20 top-10 left-0">
            <Text
                style={{
                    fontFamily: "LuckiestGuyRegular"
                }}
                className="text-5xl text-text-secondary"
            >
                Norva
            </Text>
        </View>
    );
};

export default Home;
