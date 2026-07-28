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

interface ChatOptionsProps {
    visible: boolean;
    onClose: () => void;
    onClearChat: () => void;
    onViewProfile?: () => void;
}

export default function ChatOptions({
    visible,
    onClose,
    onClearChat,
    onViewProfile
}: ChatOptionsProps) {
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
                    className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[30px] bg-primary/95 py-2 border-t border-white/10"
                >
                    {/* Handle bar */}
                    <Pressable className="items-center pb-3 pt-1">
                        <Animated.View className="h-1.5 w-12 rounded-full bg-white/20" />
                    </Pressable>

                    {onViewProfile && (
                        <Option
                            icon="user"
                            text="View Profile"
                            color="#c4c4e0"
                            onPress={() => {
                                onClose();
                                onViewProfile();
                            }}
                        />
                    )}

                    <Option
                        icon="trash-2"
                        text="Clear Chat"
                        color="#f43f5e"
                        textClass="text-[#f43f5e]"
                        onPress={() => {
                            onClose();
                            onClearChat();
                        }}
                    />

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

function Option({
    icon,
    text,
    color,
    onPress,
    textClass = "text-text/80"
}: {
    icon: any;
    text: string;
    color: string;
    onPress: () => void;
    textClass?: string;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            className="flex-row items-center gap-4 px-6 py-4"
        >
            <Feather name={icon} size={20} color={color} />
            <Text
                style={{ fontFamily: "SpaceMono" }}
                className={`text-base font-bold ${textClass}`}
            >
                {text}
            </Text>
        </TouchableOpacity>
    );
}
