import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useUserStore } from "@store/user.store.js";

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
    const isLoggedIn = useUserStore(state => state.isLoggedIn());
    // const isLoggedIn = false

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="auth" />
            </Stack.Protected>
            <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen name="(secure)/(tabs)" />
            </Stack.Protected>
        </Stack>
    );
};

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        BebasRegular: require("../assets/fonts/BebasNeue-Regular.ttf"),
        GloriaRegular: require("../assets/fonts/GloriaHallelujah-Regular.ttf"),
        LuckiestGuyRegular: require("../assets/fonts/LuckiestGuy-Regular.ttf"),
        WinkyRoughExtraBold: require("../assets/fonts/WinkyRough-ExtraBold.ttf")
    });

    if (!loaded) return null;

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "black"
            }}
        >
            <StatusBar style="auto" translucent />
            <QueryClientProvider client={client}>
                <Layout />
            </QueryClientProvider>
        </SafeAreaView>
    );
}
