import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { updateProfile } from "../../../controllers/user/profile.controller.js";
import { useUser } from "../../../store/user.store.js";

const EditProfile = () => {
    const storedFullname = useUser(s => s.fullname);
    const storedUsername = useUser(s => s.username);
    const updateProfileStore = useUser(s => s.updateProfile);

    const qc = useQueryClient();

    const [fullname, setFullname] = useState(storedFullname);
    const [username, setUsername] = useState(storedUsername);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState(null);

    const handleSave = async () => {
        if (!fullname.trim() && !username.trim()) return;
        if (fullname === storedFullname && username === storedUsername) {
            router.back();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await updateProfile({ fullname, username });

            if (!res.success) {
                if (res.message === "USERNAME_TAKEN") {
                    setError("That username is already taken.");
                } else {
                    setError("Failed to update. Try again.");
                }
                return;
            }

            // Sync Zustand + query cache
            updateProfileStore({ fullname: res.user.fullname, username: res.user.username });
            qc.invalidateQueries({ queryKey: ["profile", "me"] });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#0d0d1a" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
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
                        marginBottom: 32
                    }}
                >
                    <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                        <Feather name="arrow-left" size={22} color="#c4c4e0" />
                    </TouchableOpacity>
                    <Text style={{ color: "#fff", fontFamily: "WinkyRoughExtraBold", fontSize: 20 }}>
                        Edit Profile
                    </Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#6437ff" size="small" />
                        ) : (
                            <Text style={{ color: "#a78bfa", fontFamily: "SpaceMono", fontSize: 13 }}>
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

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

                {/* Full name */}
                <Text style={{ color: "rgba(196,196,224,0.5)", fontFamily: "SpaceMono", fontSize: 11, marginBottom: 8 }}>
                    FULL NAME
                </Text>
                <TextInput
                    value={fullname}
                    onChangeText={setFullname}
                    placeholder="Your name"
                    placeholderTextColor="#444"
                    maxLength={60}
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
                <Text style={{ color: "rgba(196,196,224,0.5)", fontFamily: "SpaceMono", fontSize: 11, marginBottom: 8 }}>
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
                    <Text style={{ color: "rgba(196,196,224,0.3)", fontFamily: "SpaceMono", fontSize: 14 }}>
                        @
                    </Text>
                    <TextInput
                        value={username}
                        onChangeText={t => setUsername(t.toLowerCase().replace(/\s/g, ""))}
                        placeholder="username"
                        placeholderTextColor="#444"
                        maxLength={30}
                        autoCapitalize="none"
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