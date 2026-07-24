import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { editPost } from "../../../../controllers/post/feed.controller.js";

const EditPost = () => {
    const {
        postId,
        title: initTitle,
        description: initDesc,
        tags: initTags
    } = useLocalSearchParams();

    const qc = useQueryClient();

    const [title, setTitle] = useState(initTitle ?? "");
    const [description, setDescription] = useState(initDesc ?? "");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState(() => {
        try {
            return JSON.parse(initTags ?? "[]");
        } catch {
            return [];
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addTag = () => {
        const cleaned = tagInput.trim().toLowerCase().replace(/^#/, "");
        if (!cleaned || tags.includes(cleaned) || tags.length >= 6) return;
        setTags(prev => [...prev, cleaned]);
        setTagInput("");
    };

    const removeTag = tag => setTags(prev => prev.filter(t => t !== tag));

    const handleSave = async () => {
        if (!title.trim() && !description.trim()) {
            setError("Add at least a title or description.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await editPost(postId, { title, description, tags });
            if (!res.success) throw new Error();

            // Patch feed cache so card updates instantly
            qc.setQueryData(["feed"], old => {
                if (!old?.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        posts: page.posts.map(p =>
                            p._id === postId
                                ? {
                                      ...p,
                                      title,
                                      description,
                                      tags,
                                      isEdited: true
                                  }
                                : p
                        )
                    }))
                };
            });

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
        } catch {
            setError("Failed to save. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1 bg-primary">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-8 mt-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={10}
                    >
                        <Feather name="arrow-left" size={22} color="#c4c4e0" />
                    </TouchableOpacity>
                    <Text
                        className="text-text text-xl"
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                    >
                        Edit Post
                    </Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className="bg-btn px-4 py-2 rounded-2xl"
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text
                                className="text-white text-sm"
                                style={{ fontFamily: "SpaceMono" }}
                            >
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {error && (
                    <Text
                        className="text-[#f43f5e] text-xs mb-4 text-center"
                        style={{ fontFamily: "SpaceMono" }}
                    >
                        {error}
                    </Text>
                )}

                {/* Title */}
                <Text
                    className="text-text/50 text-xs mb-2"
                    style={{ fontFamily: "SpaceMono" }}
                >
                    TITLE
                </Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Post title..."
                    placeholderTextColor="#444"
                    maxLength={220}
                    className="bg-card-selected border border-border rounded-2xl px-4 py-3 text-text mb-6"
                    style={{ fontFamily: "SpaceMono", fontSize: 14 }}
                />

                {/* Description */}
                <Text
                    className="text-text/50 text-xs mb-2"
                    style={{ fontFamily: "SpaceMono" }}
                >
                    DESCRIPTION
                </Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What's this about..."
                    placeholderTextColor="#444"
                    multiline
                    maxLength={3000}
                    numberOfLines={5}
                    textAlignVertical="top"
                    className="bg-card-selected border border-border rounded-2xl px-4 py-3 text-text mb-6"
                    style={{
                        fontFamily: "SpaceMono",
                        fontSize: 13,
                        minHeight: 110
                    }}
                />

                {/* Tags */}
                <Text
                    className="text-text/50 text-xs mb-2"
                    style={{ fontFamily: "SpaceMono" }}
                >
                    TAGS
                </Text>
                <View className="flex-row items-center gap-2 mb-3">
                    <TextInput
                        value={tagInput}
                        onChangeText={setTagInput}
                        onSubmitEditing={addTag}
                        placeholder="#tag"
                        placeholderTextColor="#444"
                        returnKeyType="done"
                        className="flex-1 bg-card-selected border border-border rounded-2xl px-4 py-3 text-text"
                        style={{ fontFamily: "SpaceMono", fontSize: 13 }}
                    />
                    <TouchableOpacity
                        onPress={addTag}
                        className="bg-btn w-10 h-10 rounded-full items-center justify-center"
                    >
                        <Feather name="plus" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap gap-2">
                    {tags.map(tag => (
                        <TouchableOpacity
                            key={tag}
                            onPress={() => removeTag(tag)}
                            className="bg-card-selected border border-btn/30 rounded-2xl px-3 py-1 flex-row items-center gap-1.5"
                        >
                            <Text
                                className="text-btn text-xs"
                                style={{ fontFamily: "SpaceMono" }}
                            >
                                #{tag}
                            </Text>
                            <Feather name="x" size={11} color="#6437ff" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EditPost;
