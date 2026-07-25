import { useEffect } from "react";
import {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedKeyboard,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPRING = {
    damping: 22,
    stiffness: 260,
    mass: 0.8
};

export const useCommentSheetAnimation = visible => {
    const translateY = useSharedValue(600);
    const backdropOpacity = useSharedValue(0);
    const insets = useSafeAreaInsets();

    // 1. Tracks native keyboard frame height synchronously on UI thread
    const keyboard = useAnimatedKeyboard();

    useEffect(() => {
        if (visible) {
            backdropOpacity.value = withTiming(1);
            translateY.value = withSpring(0, SPRING);
        } else {
            backdropOpacity.value = withTiming(0);
            translateY.value = withSpring(600, SPRING);
        }
    }, [visible]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        // 2. Smoothly expands bottom padding when keyboard opens,
        // and falls back to safe area bottom inset when closed
        paddingBottom: Math.max(insets.bottom, keyboard.height.value)
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value
    }));

    return {
        sheetStyle,
        backdropStyle
    };
};
