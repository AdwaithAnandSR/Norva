import { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView
} from "react-native";
import { router } from "expo-router";

import { buttonGlow, orangeGlow } from "@constants/style.js";
import { pickImage } from "../../../../utils/imagePick.js";
import { uploadToCloudinary } from "../../../../utils/cloudinary.js";
import { createPost } from "../../../../controllers/post/feed.controller.js";

import {
    Preview as ImagePreview,
    Header
} from "../../../../components/feed/CreatePost.jsx";

const CreatePost = () => {
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState("");
    const [uploadProgress, setUploadProgress] = useState(-1);

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
        setUploadProgress(0);
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
            const uploadResult = await uploadToCloudinary(image, p =>
                setUploadProgress(p)
            );

            if (!uploadResult.success) {
                setUploadProgress(-1);
                return setMessage("Failed to upload media");
            }

            uploadedMedia = uploadResult;
        }

        setMessage("Creating post, please wait..");

        const createRes = await createPost({
            title,
            description,
            tags,
            media: uploadedMedia,
            imageDetails: image?.assets?.[0] ?? {}
        });

        if (createRes) {
            setImage(null);
            titleValue.current = "";
            descValue.current = "";
            tagsValue.current = "";
            setMessage("Successfully created new post");
            router.back();
        } else setMessage("Failed to create post!");

        setUploadProgress(-1);
    };

    return (
        <ScrollView
            className="bg-primary"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 25 }}
        >
            <Header handleCreatePost={handleCreatePost} />

            <View className="gap-3 mt-10 px-2">
                {message && (
                    <Text
                        className={`font-bold text-md text-center ${message.toLowerCase().includes("failed") ? "text-red-500" : "text-text-secondary"} `}
                    >
                        {message}
                        {uploadProgress > 0 && " (" + uploadProgress + "%)"}
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
                    <ImagePreview
                        uri={image?.assets?.[0]?.uri}
                        uploadProgress={uploadProgress}
                    />
                )}
            </View>
        </ScrollView>
    );
};
export default CreatePost;
