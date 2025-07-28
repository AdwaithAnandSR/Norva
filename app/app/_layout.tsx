import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStateProvider } from "../context/app.context.js";
import { storage } from "../storage/storage.js";

const userId = storage.getString("userId");
const isAuth = userId?.trim()?.length > 0;

const Layout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!isAuth}>
                <Stack.Screen name="auth" />
            </Stack.Protected>
            <Stack.Protected guard={isAuth}>
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
            <AppStateProvider>
                <Layout />
            </AppStateProvider>
        </SafeAreaView>
    );
}
