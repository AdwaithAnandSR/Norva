import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withSpring,
    withTiming,
    runOnJS
} from "react-native-reanimated";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const DoubleTapHeart = forwardRef((props, ref) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    const playing = useRef(false);

    const resetPlaying = () => {
        playing.current = false;
    };

    const animateHeart = () => {
        if (playing.current) return;

        playing.current = true;

        scale.value = 0;
        opacity.value = 1;

        scale.value = withSequence(
            withSpring(1.25, {
                damping: 8,
                stiffness: 220
            }),
            withSpring(1, {
                damping: 20,
                stiffness: 300
            })
        );

        opacity.value = withTiming(
            0,
            {
                duration: 800
            },
            finished => {
                if (finished) {
                    runOnJS(resetPlaying)();
                }
            }
        );
    };

    useImperativeHandle(ref, () => ({
        triggerHeart: animateHeart
    }));

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    return (
        <Animated.View
            pointerEvents="none"
            style={[styles.overlay, animatedStyle]}
        >
            <AnimatedSvg width={120} height={120} viewBox="0 0 24 24">
                <Path
                    fill="#fbb4d5"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
            </AnimatedSvg>
        </Animated.View>
    );
});

export default DoubleTapHeart;

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: -60,
        marginTop: -60,
        justifyContent: "center",
        alignItems: "center"
    }
});
