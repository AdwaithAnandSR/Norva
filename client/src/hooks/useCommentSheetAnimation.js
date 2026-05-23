import { useEffect } from "react";

import {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from "react-native-reanimated";

const SPRING = {
    damping: 22,
    stiffness: 260,
    mass: 0.8
};

export const useCommentSheetAnimation = visible => {
    const translateY = useSharedValue(600);
    const backdropOpacity = useSharedValue(0);

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
        transform: [
            {
                translateY: translateY.value
            }
        ]
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value
    }));

    return {
        sheetStyle,
        backdropStyle
    };
};
