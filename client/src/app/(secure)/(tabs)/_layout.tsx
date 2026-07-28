import { Tabs, useSegments } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useResolveClassNames } from "uniwind";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    const { color: iconColor, borderColor: indicatorColor } =
        useResolveClassNames("text-text-secondary border-btn/90"); // Removed bg-primary since we are using BlurView for the background

    const segments = useSegments();
    const currentRoute = segments[segments.length - 1];
    const isHidden = currentRoute === "Feeds";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: indicatorColor,
                tabBarInactiveTintColor: iconColor,
                tabBarStyle: [
                    styles.floatingTabBar,
                    isHidden && { display: "none" }
                ]
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={26}
                            color={color}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name="Search"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "search" : "search-outline"}
                            size={26}
                            color={color}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name="Feeds"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "film" : "film-outline"}
                            size={26}
                            color={color}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name="Profile"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={26}
                            color={color}
                        />
                    )
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    floatingTabBar: {
        position: "absolute",
        bottom: 10,
        height: 65,
        width: "90%",
        marginLeft: "5%",
        borderRadius: 35,
        borderTopWidth: 0,
        paddingTop: 10,
        backgroundColor: "#03030894",
        elevation: 0
    }
});
