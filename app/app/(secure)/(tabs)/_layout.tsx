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
                        intensity={80}
                        tint="dark"
                        style={styles.blurView}
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
        borderTopLeftRadius: 23,
        borderTopRightRadius: 23,
        position: "absolute",
        bottom: 0,
        elevation: 20, // fix showing a box behind tabbar
        zIndex: 999999,
        height: 50,
        overflow: "hidden"
    },
    
});

export default TabsLayout;
