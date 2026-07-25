import { useState, useEffect, useRef } from "react";
import {
    View,
    Image,
    Pressable,
    Dimensions,
    StatusBar,
    Text
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useVideoPlayer } from "expo-video";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView
} from "react-native-gesture-handler";
import { BlurView, BlurTargetView } from "expo-blur";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from "react-native-reanimated";

import ReelPlayer from "../../../components/feed/ReelPlayer";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function ImageScreen() {
    const {
        postId,
        uri,
        mediaType = "image",
        width,
        height
    } = useLocalSearchParams();

    const blurTargetRef = useRef(null);

    const [originalView, setOriginalView] = useState(false);

    const ratio = width && height ? Number(width) / Number(height) : 1;

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const dismissY = useSharedValue(0);
    const opacity = useSharedValue(1);

    const pinchGesture = Gesture.Pinch()
        .onUpdate(e => {
            scale.value = savedScale.value * e.scale;
            if (scale.value < 0.85) scale.value = 0.85;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const panGesture = Gesture.Pan()
        .onUpdate(e => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + e.translationX;
                translateY.value = savedTranslateY.value + e.translationY;
            } else {
                dismissY.value = e.translationY;
                const progress = 1 - Math.abs(e.translationY) / SCREEN_HEIGHT;
                opacity.value = Math.max(progress, 0.25);
            }
        })
        .onEnd(() => {
            if (scale.value > 1) {
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
                return;
            }

            if (Math.abs(dismissY.value) > 180) runOnJS(router.back)();
            else {
                dismissY.value = withSpring(0);
                opacity.value = withTiming(1);
            }
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd(() => {
            scale.value = withSpring(1);
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedScale.value = 1;
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
        });

    const gesture = Gesture.Simultaneous(
        pinchGesture,
        panGesture,
        doubleTapGesture
    );

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateY: dismissY.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ]
        };
    });

    return (
        <GestureHandlerRootView>
            <StatusBar hidden />

            <BlurTargetView
                ref={blurTargetRef}
                style={{
                    flex: 1,
                    backgroundColor: "black"
                }}
            >
                <View
                    style={{
                        top: 56,
                        zIndex: 100
                    }}
                    className="absolute px-4 w-full flex-row items-start justify-between"
                >
                    <BlurView
                        blurTarget={blurTargetRef}
                        blurMethod="dimezisBlurViewSdk31Plus"
                        intensity={60}
                        tint="dark"
                        style={{
                            borderRadius: 999,
                            overflow: "hidden"
                        }}
                    >
                        <Pressable
                            onPress={() => router.back()}
                            className="px-2 py-2 rounded-3xl flex-row justify-center items-center gap-1"
                        >
                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color="white"
                            />
                            <Text className="text-text font-bold text-lg">
                                Back
                            </Text>
                        </Pressable>
                    </BlurView>
                    <View className="gap-5 justify-center">
                        <BlurView
                            blurTarget={blurTargetRef}
                            blurMethod="dimezisBlurViewSdk31Plus"
                            intensity={60}
                            tint="dark"
                            style={{
                                borderRadius: 999,
                                overflow: "hidden"
                            }}
                        >
                            <Pressable
                                onPress={() => setOriginalView(p => !p)}
                                className="px-2 py-2 rounded-3xl flex-row justify-center items-center gap-1"
                            >
                                <MaterialIcons
                                    name="fullscreen-exit"
                                    size={24}
                                    color="white"
                                />
                            </Pressable>
                        </BlurView>
                        <BlurView
                            blurTarget={blurTargetRef}
                            blurMethod="dimezisBlurViewSdk31Plus"
                            intensity={60}
                            tint="dark"
                            style={{
                                borderRadius: 999,
                                overflow: "hidden"
                            }}
                        >
                            <Pressable
                                className="px-2 py-2 rounded-3xl flex-row justify-center items-center gap-1"
                                hitSlop={10}
                            >
                                <Feather
                                    name="more-horizontal"
                                    size={24}
                                    color="#fff"
                                />
                            </Pressable>
                        </BlurView>
                    </View>
                </View>

                {/* IMAGE */}

                <View className="flex-1 justify-center items-center">
                    <GestureDetector gesture={gesture}>
                        {mediaType === "video" ? (
                            <Animated.View
                                style={[
                                    {
                                        width: "100%",
                                        ...(originalView
                                            ? { aspectRatio: ratio }
                                            : { flex: 1 })
                                    },
                                    animatedStyle
                                ]}
                            >
                                <ReelPlayer
                                    uri={uri}
                                    contentFit={
                                        originalView ? "contain" : "cover"
                                    }
                                    style={{ flex: 1 }}
                                    isActive={true}
                                />
                            </Animated.View>
                        ) : (
                            <AnimatedImage
                                sharedTransitionTag={`image-${postId}`}
                                source={{ uri }}
                                resizeMode={originalView ? "contain" : "cover"}
                                style={[
                                    {
                                        width: "100%",
                                        ...(originalView
                                            ? { aspectRatio: ratio }
                                            : { flex: 1 })
                                    },
                                    animatedStyle
                                ]}
                            />
                        )}
                    </GestureDetector>
                </View>
            </BlurTargetView>
        </GestureHandlerRootView>
    );
}
