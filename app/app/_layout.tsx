import { Stack } from "expo-router";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

const isAuth = false;

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
        WinkyRoughExtraBold: require("../assets/fonts/winky/WinkyRough-ExtraBold.ttf")
    });

    if (!loaded) return null;

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <Layout />
        </View>
    );
}
