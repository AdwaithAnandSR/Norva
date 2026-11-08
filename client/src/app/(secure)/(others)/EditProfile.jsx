import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { updateProfile } from "../../../controllers/user/profile.controller.js";
import { useUser } from "../../../store/user.store.js";
import { useApp } from "../../../store/app.store.js";
import { pickImage } from "../../../utils/imagePick.js";
import { uploadToCloudinary } from "../../../utils/cloudinary.js";

import Loader from "../../../components/common/Loader.tsx";
import InitialsAvatar from "../../../components/search/InitialsAvatar.jsx";

const EditProfile = () => {
    const storedFullname = useUser(s => s.fullname);
    const storedUsername = useUser(s => s.username);
    const storedProfileImage = useUser(s => s.profileImage);
    const storedBackgroundImage = useUser(s => s.backgroundImage);
    const updateProfileStore = useUser(s => s.updateProfile);
    const setToast = useApp(s => s.setToast);

    const qc = useQueryClient();

    const [fullname, setFullname] = useState(storedFullname);
    const [username, setUsername] = useState(storedUsername);

    // Image files picked from picker (null if unchanged)
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [backgroundImageFile, setBackgroundImageFile] = useState(null);

    // Image previews (local URI or Cloudinary URL)
    const [profileImagePreview, setProfileImagePreview] =
        useState(storedProfileImage);
    const [backgroundImagePreview, setBackgroundImagePreview] = useState(
        storedBackgroundImage
    );

    // Upload progress states (null when not uploading, 0..100 when uploading)
    const [profileProgress, setProfileProgress] = useState(null);
    const [coverProgress, setCoverProgress] = useState(null);

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState(null);

    const handlePickProfileImage = async () => {
        const { success, result } = await pickImage();
        if (success && result?.assets?.[0]?.uri) {
            setProfileImageFile(result);
            setProfileImagePreview(result.assets[0].uri);
        }
    };

    const handlePickBackgroundImage = async () => {
        const { success, result } = await pickImage();
        if (success && result?.assets?.[0]?.uri) {
            setBackgroundImageFile(result);
            setBackgroundImagePreview(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        const isNameChanged = fullname.trim() !== storedFullname;
        const isUsernameChanged = username.trim() !== storedUsername;
        const isProfileImgChanged = !!profileImageFile;
        const isBackgroundImgChanged = !!backgroundImageFile;

        if (!fullname.trim() && !username.trim()) return;

        if (
            !isNameChanged &&
            !isUsernameChanged &&
            !isProfileImgChanged &&
            !isBackgroundImgChanged
        ) {
            router.back();
            return;
        }

        setLoading(true);
        setError(null);
        setStatusMessage("Preparing upload...");

        try {
            let newProfileImageUrl = storedProfileImage;
            let newBackgroundImageUrl = storedBackgroundImage;

            if (profileImageFile) {
                setStatusMessage("Uploading profile picture...");
                setProfileProgress(0);
                const uploadRes = await uploadToCloudinary(
                    profileImageFile,
                    p => setProfileProgress(p),
                    "profiles"
                );
                if (!uploadRes.success) {
                    setError(
                        "Failed to upload profile picture. Please try again."
                    );
                    setLoading(false);
                    setStatusMessage("");
                    setProfileProgress(null);
                    return;
                }
                newProfileImageUrl = uploadRes.url;
            }

            if (backgroundImageFile) {
                setStatusMessage("Uploading cover image...");
                setCoverProgress(0);
                const uploadRes = await uploadToCloudinary(
                    backgroundImageFile,
                    p => setCoverProgress(p),
                    "covers"
                );
                if (!uploadRes.success) {
                    setError("Failed to upload cover image. Please try again.");
                    setLoading(false);
                    setStatusMessage("");
                    setCoverProgress(null);
                    return;
                }
                newBackgroundImageUrl = uploadRes.url;
            }

            setStatusMessage("Updating profile...");
            const res = await updateProfile({
                fullname: fullname.trim(),
                username: username.trim(),
                profileImage: newProfileImageUrl,
                backgroundImage: newBackgroundImageUrl
            });

            if (!res.success) {
                if (res.message === "USERNAME_TAKEN") {
                    setError("That username is already taken.");
                } else {
                    setError("Failed to update profile. Try again.");
                }
                return;
            }

            // Sync Zustand + query cache
            updateProfileStore({
                fullname: res.user.fullname,
                username: res.user.username,
                profileImage: res.user.profileImage,
                backgroundImage: res.user.backgroundImage
            });

            qc.invalidateQueries({ queryKey: ["profile", "me"] });
            qc.invalidateQueries({ queryKey: ["profile"] });

            setToast("green=>Edited");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
        } catch (err) {
            setToast("red=>Failed");
            console.error("EditProfile save error:", err);
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
            setStatusMessage("");
            setProfileProgress(null);
            setCoverProgress(null);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#0d0d1a" }}>
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 16,
                        marginBottom: 24
                    }}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={10}
                        disabled={loading}
                    >
                        <Feather name="arrow-left" size={22} color="#c4c4e0" />
                    </TouchableOpacity>
                    <Text
                        style={{
                            color: "#fff",
                            fontFamily: "WinkyRoughExtraBold",
                            fontSize: 20
                        }}
                    >
                        Edit Profile
                    </Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <Loader color="#6437ff" size="small" />
                        ) : (
                            <Text
                                style={{
                                    color: "#a78bfa",
                                    fontFamily: "SpaceMono",
                                    fontSize: 14,
                                    fontWeight: "600"
                                }}
                            >
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {statusMessage !== "" && (
                    <Text
                        style={{
                            color: "#a78bfa",
                            fontFamily: "SpaceMono",
                            fontSize: 12,
                            textAlign: "center",
                            marginBottom: 16
                        }}
                    >
                        {statusMessage}
                    </Text>
                )}

                {error && (
                    <Text
                        style={{
                            color: "#f43f5e",
                            fontFamily: "SpaceMono",
                            fontSize: 12,
                            textAlign: "center",
                            marginBottom: 16
                        }}
                    >
                        {error}
                    </Text>
                )}

                {/* Images Container */}
                <View style={{ marginBottom: 32 }}>
                    {/* Cover Photo */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handlePickBackgroundImage}
                        disabled={loading}
                        style={{
                            height: 140,
                            borderRadius: 18,
                            overflow: "hidden",
                            backgroundColor: "#1a1a2e",
                            position: "relative",
                            borderWidth: 1,
                            borderColor: "rgba(100,55,255,0.2)"
                        }}
                    >
                        {backgroundImagePreview ? (
                            <Image
                                source={{ uri: backgroundImagePreview }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        ) : null}
                        <View
                            style={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: "rgba(0,0,0,0.45)",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            {coverProgress !== null ? (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "rgba(0,0,0,0.75)",
                                        paddingHorizontal: 14,
                                        paddingVertical: 8,
                                        borderRadius: 20
                                    }}
                                >
                                    <Loader
                                        size="small"
                                        color="#a78bfa"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontFamily: "SpaceMono",
                                            fontSize: 12,
                                            fontWeight: "bold"
                                        }}
                                    >
                                        Uploading {coverProgress}%
                                    </Text>
                                </View>
                            ) : (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "rgba(0,0,0,0.6)",
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 20
                                    }}
                                >
                                    <Ionicons
                                        name="camera-outline"
                                        size={18}
                                        color="#fff"
                                    />
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontFamily: "SpaceMono",
                                            fontSize: 11,
                                            marginLeft: 6
                                        }}
                                    >
                                        Change Cover
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Profile Avatar */}
                    <View
                        style={{
                            alignSelf: "flex-start",
                            marginLeft: 16,
                            marginTop: -44
                        }}
                    >
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handlePickProfileImage}
                            disabled={loading}
                            style={{
                                width: 88,
                                height: 88,
                                borderRadius: 44,
                                borderWidth: 4,
                                borderColor: "#0d0d1a",
                                overflow: "hidden",
                                backgroundColor: "#1a1a2e",
                                position: "relative"
                            }}
                        >
                            {profileImagePreview ? (
                                <Image
                                    source={{ uri: profileImagePreview }}
                                    style={{ width: "100%", height: "100%" }}
                                    contentFit="cover"
                                />
                            ) : (
                                <InitialsAvatar
                                    fullname={username}
                                    size={88}
                                />
                            )}
                            <View
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                            >
                                {profileProgress !== null ? (
                                    <View
                                        style={{
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <Loader size="small" color="#a78bfa" />
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontFamily: "SpaceMono",
                                                fontSize: 10,
                                                fontWeight: "bold",
                                                marginTop: 2
                                            }}
                                        >
                                            {profileProgress}%
                                        </Text>
                                    </View>
                                ) : (
                                    <Ionicons
                                        name="camera"
                                        size={22}
                                        color="#fff"
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Full name */}
                <Text
                    style={{
                        color: "rgba(196,196,224,0.5)",
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        marginBottom: 8
                    }}
                >
                    FULL NAME
                </Text>
                <TextInput
                    value={fullname}
                    onChangeText={setFullname}
                    placeholder="Your name"
                    placeholderTextColor="#444"
                    maxLength={60}
                    editable={!loading}
                    style={{
                        backgroundColor: "#1a1a2e",
                        borderWidth: 1,
                        borderColor: "rgba(100,55,255,0.2)",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        color: "#fff",
                        fontFamily: "SpaceMono",
                        fontSize: 14,
                        marginBottom: 24
                    }}
                />

                {/* Username */}
                <Text
                    style={{
                        color: "rgba(196,196,224,0.5)",
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        marginBottom: 8
                    }}
                >
                    USERNAME
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#1a1a2e",
                        borderWidth: 1,
                        borderColor: "rgba(100,55,255,0.2)",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        marginBottom: 24
                    }}
                >
                    <Text
                        style={{
                            color: "rgba(196,196,224,0.3)",
                            fontFamily: "SpaceMono",
                            fontSize: 14
                        }}
                    >
                        @
                    </Text>
                    <TextInput
                        value={username}
                        onChangeText={t =>
                            setUsername(t.toLowerCase().replace(/\s/g, ""))
                        }
                        placeholder="username"
                        placeholderTextColor="#444"
                        maxLength={30}
                        autoCapitalize="none"
                        editable={!loading}
                        style={{
                            flex: 1,
                            paddingVertical: 14,
                            paddingLeft: 4,
                            color: "#fff",
                            fontFamily: "SpaceMono",
                            fontSize: 14
                        }}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EditProfile;
