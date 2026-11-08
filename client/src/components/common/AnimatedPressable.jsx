import React from "react";
import { Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export const AnimatedPressable = ({
    children,
    onPress,
    onLongPress,
    style,
    scaleTo = 0.93,
    springConfig = { damping: 14, stiffness: 240 },
    disabled = false,
    hitSlop,
    className,
    ...props
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    const handlePressIn = () => {
        if (!disabled) {
            scale.value = withSpring(scaleTo, springConfig);
        }
    };

    const handlePressOut = () => {
        if (!disabled) {
            scale.value = withSpring(1, springConfig);
        }
    };

    return (
        <AnimatedPressableBase
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabled}
            hitSlop={hitSlop}
            className={className}
            style={[style, animatedStyle]}
            {...props}
        >
            {children}
        </AnimatedPressableBase>
    );
};

export default AnimatedPressable;
