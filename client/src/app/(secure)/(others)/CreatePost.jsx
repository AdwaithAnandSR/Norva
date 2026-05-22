import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    TextInput
} from "react-native";
import { Image } from "expo-image";

import { buttonGlow, orangeGlow } from "@constants/style.js";
import { pickImage } from "../../../utils/imagePick.js";
import { uploadToCloudinary } from "../../../utils/cloudinary.js";
import { createPost } from "../../../controllers/post/create.post.js";

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const { height: vh } = Dimensions.get("window");

const CreatePost = () => {
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState("");

    const descRef = useRef(null);
    const tagsRef = useRef(null);
    const tagsValue = useRef(null);
    const descValue = useRef(null);
    const titleValue = useRef(null);

    const handleImagePick = async () => {
        const { success, result } = await pickImage();
        if (success) setImage(result);
    };

    const handleCreatePost = async () => {
        setMessage("Creating post, please wait..");
        const title = titleValue?.current,
            description = descValue?.current;
        let tags = tagsValue?.current;

        if (!title && !description && !image)
            return setMessage(
                "Please add a title and description, select an image/video, or both before creating a post."
            );

        tags = tags
            ?.toLowerCase()
            ?.split(",")
            ?.map(i => i?.trim());

        let uploadedMedia = null;

        if (image) {
            setMessage("Uploading media...");
            const uploadResult = await uploadToCloudinary(image);

            if (!uploadResult.success)
                return setMessage("Failed to upload media");

            uploadedMedia = uploadResult;
        }

        setMessage("Creating post, please wait..");

        const createRes = await createPost({
            title,
            description,
            tags,
            media: uploadedMedia
        });

        if (createRes) {
            setImage(null);
            titleValue.current = "";
            descValue.current = "";
            tagsValue.current = ""
            setMessage("Successfully created new post");
        } else setMessage("Failed to create post!");
    };

    return (
        <View className="bg-primary flex-1 top-0">
            <View className="flex-row items-center justify-between px-3 pt-12">
                <TouchableOpacity onPress={() => setCreatingPost(false)}>
                    <Text className="font-black text-2xl text-text">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreatePost}>
                    <Text className="font-black text-2xl text-text">
                        Create
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="gap-3 mt-10 px-2">
                {message && (
                    <Text
                        className={`font-bold text-md text-center ${message.toLowerCase().includes("failed") ? "text-red-500" : "text-text-secondary"} `}
                    >
                        {message}
                    </Text>
                )}
                <TextInput
                    style={buttonGlow}
                    className="border border-border rounded-3xl text-text text-lg font-bold p-5"
                    placeholder="title"
                    onSubmitEditing={() => descRef.current?.focus()}
                    blurOnSubmit={false}
                    returnKeyType="next"
                    onChangeText={txt => (titleValue.current = txt)}
                />
                <TextInput
                    ref={descRef}
                    style={buttonGlow}
                    className="border border-border rounded-3xl text-text text-lg font-bold p-5"
                    placeholder="description"
                    onChangeText={txt => (descValue.current = txt)}
                    onSubmitEditing={() => tagsRef.current?.focus()}
                    blurOnSubmit={false}
                    returnKeyType="next"
                />
                <TextInput
                    ref={tagsRef}
                    style={buttonGlow}
                    className="border border-border rounded-3xl text-text text-lg font-bold p-5"
                    placeholder="tags: tag1, tag2, etc"
                    autoCapitalize="none"
                    onChangeText={txt => (tagsValue.current = txt)}
                />

                <TouchableOpacity
                    style={orangeGlow}
                    onPress={handleImagePick}
                    className="mt-3 rounded-3xl w-[80%] py-3 justify-center items-center self-center"
                >
                    <Text className="text-xl font-bold text-text">
                        Choose File
                    </Text>
                </TouchableOpacity>

                {image && (
                    <Image
                        source={{ uri: image?.assets?.[0]?.uri }}
                        style={{
                            width: "100%",
                            height: 300,
                            borderRadius: 20
                        }}
                        className="border border-border"
                        placeholder={{ blurhash }}
                        contentFit="cover"
                    />
                )}
            </View>
        </View>
    );
};
export default CreatePost;
