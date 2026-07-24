import "../global.css";

import { Stack } from "expo-router";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useUser } from "../store/user.store.js";
import Toast from "../components/common/Toast.jsx";

const client = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                const status = error?.response?.status || error?.status;
                if (status === 401) return false;
                else return failureCount < 3;
            }
        }
    }
});

const Layout = () => {
    const isLoggedIn = useUser(state => state.isLoggedIn());

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right"
            }}
        >
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="auth" />
            </Stack.Protected>
            <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen name="(secure)/(tabs)" />
                <Stack.Screen name="(secure)/(others)" />
                <Stack.Screen
                    options={{
                        animation: "fade",
                        presentation: "transparentModal"
                    }}
                    name="(secure)/(models)"
                />
            </Stack.Protected>
        </Stack>
    );
};

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
        BebasRegular: require("../../assets/fonts/BebasNeue-Regular.ttf"),
        GloriaRegular: require("../../assets/fonts/GloriaHallelujah-Regular.ttf"),
        LuckiestGuyRegular: require("../../assets/fonts/LuckiestGuy-Regular.ttf"),
        WinkyRoughExtraBold: require("../../assets/fonts/WinkyRough-ExtraBold.ttf")
    });

    if (!loaded) return null;

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "black"
            }}
        >
            <StatusBar style="auto" translucent animated />
            <QueryClientProvider client={client}>
                <Layout />
            </QueryClientProvider>
            <Toast />
        </View>
    );
}
