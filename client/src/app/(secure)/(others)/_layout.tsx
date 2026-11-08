import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
            style={{
                flex: 1,
                backgroundColor: "black"
            }}
        />
    );
};

export default Layout;
