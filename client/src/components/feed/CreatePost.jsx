import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image as RNImage } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming
} from "react-native-reanimated";

const StyledImage = Animated.createAnimatedComponent(Image);

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

export const Header = ({ handleCreatePost }) => {
    return (
        <View className="flex-row items-center justify-between px-3 pt-12">
            <TouchableOpacity onPress={() => router.back()}>
                <Text className="font-black text-2xl text-text">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreatePost}>
                <Text className="font-black text-2xl text-text">Create</Text>
            </TouchableOpacity>
        </View>
    );
};

export const Preview = ({ uri, uploadProgress }) => {
    const [ratio, setRatio] = useState(1);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(0);

    useEffect(() => {
        if (uri) {
            RNImage.getSize(
                uri,
                (width, height) => {
                    setRatio(width / height);
                },
                error => {
                    console.log(error);
                }
            );
        }
    }, [uri]);

    useEffect(() => {
        if (uploadProgress > 0) {
            opacity.value = withTiming(0.45, { duration: 800 });
            scale.value = withTiming(1, { duration: 800 });
        }
    }, [uploadProgress]);

    const animatedImage = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    const animatedProgressValie = useAnimatedStyle(() => ({
        scale: scale.value
    }));

    return (
        <View className="relative overflow-hidden">
            <StyledImage
                source={{ uri }}
                style={[
                    {
                        width: "100%",
                        aspectRatio: ratio,
                        borderRadius: 20
                    },
                    animatedImage
                ]}
                className="border border-border"
                placeholder={{ blurhash }}
                contentFit="cover"
            />

            {uploadProgress > 0 && (
                <View className="absolute inset-0 items-center justify-center">
                    <Animated.Text
                        className="text-blue-700 text-9xl "
                        style={[
                            { fontFamily: "LuckiestGuyRegular" },
                            animatedProgressValie
                        ]}
                    >
                        {uploadProgress}
                    </Animated.Text>
                </View>
            )}
        </View>
    );
};
