import { Stack, Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Entypo, Feather, FontAwesome, Fontisto } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const iconSize = 26;

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: "#0ffba0",
                tabBarInactiveTintColor: "white",
                tabBarStyle: styles.tabBarStyle,
                tabBarBackground: () => (
                    <BlurView
                        tint="dark"
                        intensity={100}
                        style={StyleSheet.absoluteFill}
                    />
                )
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color }) => (
                        <Entypo name="home" size={iconSize} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="Search"
                options={{
                    tabBarIcon: ({ color }) => (
                        <Feather name="search" size={iconSize} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="Feeds"
                options={{
                    tabBarIcon: ({ color }) => (
                        <Fontisto name="film" size={iconSize} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="Profile"
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesome
                            name="user"
                            size={iconSize}
                            color={color}
                        />
                    )
                }}
            />
        </Tabs>
    );
};

const styles = StyleSheet.create({
    tabBarStyle: {
        borderTopWidth: 0,
        borderRadius: 26,
        width: "90%",
        paddingBottom: 10,
        paddingTop: 10,
        marginHorizontal: "5%",
        position: "absolute",
        bottom: 20,
        zIndex: 999,
        overflow: "hidden",
        elevation: 80
    }
});

export default TabsLayout;
