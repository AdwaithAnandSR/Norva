import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";

import { useApp } from "../../store/app.store.js";

const Toast = () => {
    const toast = useApp(state => state.toast);
    const setToast = useApp(state => state.setToast);

    const translateY = useSharedValue(-100);

    useEffect(() => {
        if (!toast) return;

        translateY.value = withTiming(0, { duration: 400 });

        const timer = setTimeout(() => {
            translateY.value = withTiming(-100, { duration: 250 });

            setTimeout(() => {
                setToast();
            }, 250);
        }, 2000);

        return () => clearTimeout(timer);
    }, [toast]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }));

    if (!toast) return null;

    const [color, message] = toast.split("=>");

    const colorClass =
        {
            green: "text-green-500",
            red: "text-red-500",
            yellow: "text-yellow-500"
        }[color] || "text-text";

    let [left, right] = message?.split(" ");

    left = left?.split("&")?.join(" ");
    right = right?.split("&")?.join(" ");

    return (
        <>
            <StatusBar hidden={!!toast} animated />

            <Animated.View
                style={animatedStyle}
                className="absolute top-0 left-0 z-50 w-full flex-row items-center justify-between bg-black pt-3 pb-1 rounded-b-2xl"
            >
                <Text
                    numberOfLines={1}
                    // style={{ fontFamily: "LuckiestGuyRegular" }}
                    className={`text-xl px-8 flex-1 text-left font-bold ${colorClass}`}
                >
                    {left ?? toast}
                </Text>
                {right && (
                    <Text
                        numberOfLines={1}
                        // style={{ fontFamily: "LuckiestGuyRegular" }}
                        className={`text-xl px-8  flex-1 text-right font-bold ${colorClass}`}
                    >
                        {right}
                    </Text>
                )}
            </Animated.View>
        </>
    );
};

export default Toast;
