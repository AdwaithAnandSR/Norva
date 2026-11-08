import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity } from "react-native";
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PostOptions({
    visible,
    isOwner,
    onEdit,
    onDelete,
    onClose
}) {
    const [mounted, setMounted] = useState(visible);
    const progress = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            setMounted(true);

            progress.value = withSpring(1, {
                damping: 18,
                stiffness: 180,
                mass: 0.8
            });
        } else {
            progress.value = withTiming(0, { duration: 180 }, finished => {
                if (finished) {
                    runOnJS(setMounted)(false);
                }
            });
        }
    }, [visible]);

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1])
    }));

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(progress.value, [0, 1], [320, 0])
            },
            {
                scale: interpolate(progress.value, [0, 1], [0.98, 1])
            }
        ],
        opacity: progress.value
    }));

    if (!mounted) return null;

    return (
        <Modal
            transparent
            animationType="none"
            visible={mounted}
            onRequestClose={onClose}
        >
            <AnimatedPressable
                onPress={onClose}
                style={[
                    {
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.55)"
                    },
                    backdropStyle
                ]}
            >
                <Animated.View
                    style={sheetStyle}
                    className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[30px] bg-primary/95 py-1"
                >
                    {/* Handle */}
                    <Pressable className="items-center pb-2">
                        <Animated.View className="h-1.5 w-12 rounded-full bg-white/20" />
                    </Pressable>

                    {isOwner && (
                        <>
                            <Option
                                icon="edit-2"
                                text="Edit post"
                                color="#c4c4e0"
                                onPress={() => {
                                    onClose();
                                    onEdit?.();
                                }}
                            />

                            <Option
                                icon="trash-2"
                                text="Delete post"
                                color="#f43f5e"
                                onPress={() => {
                                    onClose();
                                    onDelete?.();
                                }}
                            />
                        </>
                    )}

                    <Option
                        icon="x"
                        text="Cancel"
                        color="#777"
                        textClass="text-text/50"
                        onPress={onClose}
                    />
                </Animated.View>
            </AnimatedPressable>
        </Modal>
    );
}

function Option({ icon, text, color, onPress, textClass = "text-text/80" }) {
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            className="flex-row items-center gap-5 px-6 py-4"
        >
            <Feather name={icon} size={20} color={color} />
            <Text className={`text-lg font-bold ${textClass}`}>{text}</Text>
        </TouchableOpacity>
    );
}
