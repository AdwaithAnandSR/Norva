import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import {
    useInfiniteMessages,
    useSendMessage
} from "../../../../hooks/chat/useChatQuery.js";
import { useChatRoomSocket } from "../../../../hooks/chat/useChatRoomSocket.js";
import { useUser } from "../../../../store/user.store.js";
import { useChatStore, Message } from "../../../../store/chat.store";
import getSocketInstance, { connectSocket } from "../../../../utils/socket.js";
import { pickImage } from "../../../../utils/imagePick.js";
import { uploadToCloudinary } from "../../../../utils/cloudinary.js";
import Loader from "../../../../components/common/Loader";

import ChatHeader from "../../../../components/chat/ChatHeader";
import MessageBubble from "../../../../components/chat/MessageBubble";
import ChatInputBar from "../../../../components/chat/ChatInputBar";
import ImagePreviewModal from "../../../../components/chat/ImagePreviewModal";
import TypingIndicator from "../../../../components/chat/TypingIndicator";

// Module-level fallback & stable props to prevent unnecessary re-renders
const EMPTY_MESSAGES: Message[] = [];
const messageKeyExtractor = (item: Message) => item._id || item.tempId || "";
const listContentContainerStyle = { paddingHorizontal: 16, paddingVertical: 12 };
const NEAR_BOTTOM_THRESHOLD = 120;

const ChatRoom = () => {
    const { id: conversationId, user: userParam } = useLocalSearchParams<{
        id: string;
        user?: string;
    }>();
    const myId = useUser((s) => s.userId);

    const [text, setText] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [sendingSocketMsg, setSendingSocketMsg] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const isNearBottomRef = useRef(true);
    const prevMessagesRef = useRef<Message[]>(EMPTY_MESSAGES);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const flatListRef = useRef<any>(null);

    const messagesQuery = useInfiniteMessages(conversationId as string);
    const sendMessageMutation = useSendMessage();

    // Granular Zustand selector: only re-renders when this specific conversation's message array changes
    const messages = useChatStore(
        (s) =>
            (conversationId
                ? s.messagesByConversation[conversationId as string]
                : undefined) || EMPTY_MESSAGES
    );
    const addOptimisticMessage = useChatStore((s) => s.addOptimisticMessage);
    const replaceTempMessage = useChatStore((s) => s.replaceTempMessage);
    const markMessageFailed = useChatStore((s) => s.markMessageFailed);
    const retryMessageAction = useChatStore((s) => s.retryMessage);
    const hydrateConversationMessages = useChatStore((s) => s.hydrateConversationMessages);
    const prependOlderMessages = useChatStore((s) => s.prependOlderMessages);

    // Dynamic socket hook for room joining, typing, and realtime events
    const { isTyping } = useChatRoomSocket(conversationId, myId);

    // Hydrate initial page into Zustand (store performs structural equality checks)
    useEffect(() => {
        if (!conversationId || !messagesQuery.data?.pages?.[0]?.messages) return;
        hydrateConversationMessages(
            conversationId as string,
            messagesQuery.data.pages[0].messages
        );
    }, [conversationId, messagesQuery.data?.pages?.[0], hydrateConversationMessages]);

    // Prepend older pages (pagination) into Zustand (store handles deduplication)
    useEffect(() => {
        if (!conversationId || !messagesQuery.data?.pages) return;
        const pages = messagesQuery.data.pages;
        if (pages.length > 1) {
            const latestPage = pages[pages.length - 1];
            if (latestPage?.messages) {
                prependOlderMessages(
                    conversationId as string,
                    latestPage.messages
                );
            }
        }
    }, [conversationId, messagesQuery.data?.pages?.length, prependOlderMessages]);

    // Parse passed target user if available
    let passedUser: any = null;
    try {
        if (userParam) {
            passedUser = JSON.parse(userParam);
        }
    } catch (err) {
        console.log("Error parsing userParam:", err);
    }

    const conversationFromQuery = messagesQuery.data?.pages?.[0]?.conversation;
    const oppositeUserFromParticipants = conversationFromQuery?.participants?.find(
        (p: any) => (p._id || p) !== myId
    );
    const otherUser = oppositeUserFromParticipants || passedUser;
    const recipientId =
        typeof otherUser === "string"
            ? otherUser
            : otherUser?._id || (typeof passedUser === "string" ? passedUser : passedUser?._id);

    const handleTextChange = (val: string) => {
        setText(val);
        const socket = getSocketInstance();

        if (socket && conversationId) {
            socket.emit("typing", { conversationId, userId: myId });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { conversationId, userId: myId });
            }, 2000);
        }
    };

    const handlePickImage = async () => {
        const result = await pickImage();
        if (result.success && result.result) {
            const asset = result.result.assets?.[0];
            if (asset?.uri) {
                setSelectedImage(asset.uri);
            }
        }
    };

    const sendViaRestFallback = (
        tempId: string,
        msgText: string,
        imgUrl: string
    ) => {
        sendMessageMutation.mutate(
            {
                conversationId: conversationId as string,
                text: msgText,
                image: imgUrl,
                tempId
            },
            {
                onSuccess: (res) => {
                    setSendingSocketMsg(false);
                    if (res?.success && res?.message) {
                        replaceTempMessage(
                            conversationId as string,
                            tempId,
                            res.message
                        );
                    } else {
                        markMessageFailed(conversationId as string, tempId);
                    }
                },
                onError: () => {
                    setSendingSocketMsg(false);
                    markMessageFailed(conversationId as string, tempId);
                }
            }
        );
    };

    const handleSendMessage = async () => {
        if (
            (!text.trim() && !selectedImage) ||
            sendingSocketMsg ||
            sendMessageMutation.isPending
        ) {
            return;
        }

        const messageText = text.trim();
        const localImg = selectedImage;

        setText("");
        setSelectedImage(null);

        let imageUrl = "";

        if (localImg) {
            setUploadingImage(true);

            const uploadRes = await uploadToCloudinary(
                { uri: localImg },
                null,
                "chats"
            );

            setUploadingImage(false);

            if (uploadRes.success && uploadRes.url) {
                imageUrl = uploadRes.url;
            } else {
                return;
            }
        }

        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const tempMessage: Message = {
            _id: tempId,
            tempId,
            conversation: conversationId as string,
            sender: myId,
            text: messageText,
            image: imageUrl,
            isTemp: true,
            status: "sending",
            isDeliveredTo: [myId],
            isReadBy: [myId],
            createdAt: new Date().toISOString()
        };

        // 1. Instantly add optimistic message to Zustand store
        addOptimisticMessage(conversationId as string, tempMessage);
        scrollToBottom();

        const socket = connectSocket();

        if (socket && conversationId) {
            socket.emit("stop_typing", {
                conversationId,
                userId: myId
            });
        }

        if (socket && socket.connected) {
            setSendingSocketMsg(true);
            let ackReceived = false;

            const ackTimeout = setTimeout(() => {
                if (!ackReceived) {
                    // Socket timed out, fallback to REST
                    sendViaRestFallback(tempId, messageText, imageUrl);
                }
            }, 4000);

            socket.emit(
                "send_message",
                {
                    tempId,
                    conversationId,
                    senderId: myId,
                    text: messageText,
                    image: imageUrl
                },
                (response: any) => {
                    ackReceived = true;
                    clearTimeout(ackTimeout);
                    setSendingSocketMsg(false);

                    if (!response?.success) {
                        // Server rejected socket message, fallback to REST
                        sendViaRestFallback(tempId, messageText, imageUrl);
                    }
                }
            );
        } else {
            setSendingSocketMsg(true);
            sendViaRestFallback(tempId, messageText, imageUrl);
        }
    };

    const handleRetryMessage = useCallback(
        (item: any) => {
            const tempId = item.tempId || item._id;
            if (!tempId || !conversationId) return;

            retryMessageAction(conversationId as string, tempId);

            const socket = connectSocket();
            if (socket && socket.connected) {
                setSendingSocketMsg(true);
                let ackReceived = false;

                const ackTimeout = setTimeout(() => {
                    if (!ackReceived) {
                        sendViaRestFallback(tempId, item.text || "", item.image || "");
                    }
                }, 4000);

                socket.emit(
                    "send_message",
                    {
                        tempId,
                        conversationId,
                        senderId: myId,
                        text: item.text || "",
                        image: item.image || ""
                    },
                    (response: any) => {
                        ackReceived = true;
                        clearTimeout(ackTimeout);
                        setSendingSocketMsg(false);

                        if (!response?.success) {
                            sendViaRestFallback(tempId, item.text || "", item.image || "");
                        }
                    }
                );
            } else {
                setSendingSocketMsg(true);
                sendViaRestFallback(tempId, item.text || "", item.image || "");
            }
        },
        [conversationId, myId, retryMessageAction]
    );

    const handleScroll = useCallback((event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const isNear = offsetY <= NEAR_BOTTOM_THRESHOLD;
        isNearBottomRef.current = isNear;
        setIsNearBottom(isNear);

        if (isNear) {
            setNewMessagesCount(0);
        }
    }, []);

    const scrollToBottom = useCallback(() => {
        setNewMessagesCount(0);
        setIsNearBottom(true);
        isNearBottomRef.current = true;
        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 50);
    }, []);

    useEffect(() => {
        const prev = prevMessagesRef.current || EMPTY_MESSAGES;
        const currentMessages = messages || EMPTY_MESSAGES;
        prevMessagesRef.current = currentMessages;

        if (currentMessages.length > prev.length) {
            const newMsg = currentMessages[0];
            const prevTopMsg = prev[0];

            if (!newMsg) return;

            const isNewLatestMessage =
                !prevTopMsg ||
                (newMsg._id && newMsg._id !== prevTopMsg._id && newMsg._id !== prevTopMsg.tempId) ||
                (newMsg.tempId && newMsg.tempId !== prevTopMsg.tempId && newMsg.tempId !== prevTopMsg._id);

            if (!isNewLatestMessage) {
                // Older messages loaded via pagination, ignore
                return;
            }

            const senderId =
                typeof newMsg.sender === "string"
                    ? newMsg.sender
                    : newMsg.sender?._id;
            const isMyMsg = senderId === myId;

            if (isMyMsg) {
                scrollToBottom();
            } else {
                if (isNearBottomRef.current) {
                    scrollToBottom();
                } else {
                    setNewMessagesCount((c) => c + 1);
                }
            }
        }
    }, [messages, myId, scrollToBottom]);

    const handleEndReached = useCallback(() => {
        if (
            messagesQuery.hasNextPage &&
            !messagesQuery.isFetchingNextPage
        ) {
            messagesQuery.fetchNextPage();
        }
    }, [messagesQuery.hasNextPage, messagesQuery.isFetchingNextPage, messagesQuery.fetchNextPage]);

    const renderFooter = useCallback(() => {
        if (!messagesQuery.isFetchingNextPage) return null;
        return (
            <View className="py-3 items-center justify-center">
                <Loader size="small" color="#6437ff" />
            </View>
        );
    }, [messagesQuery.isFetchingNextPage]);

    const renderItem = useCallback(
        ({ item }: { item: Message }) => (
            <MessageBubble
                item={item}
                myId={myId}
                recipientId={recipientId}
                onPreviewImage={setPreviewImage}
                onRetryMessage={handleRetryMessage}
            />
        ),
        [myId, recipientId, setPreviewImage, handleRetryMessage]
    );

    return (
        <View className="flex-1 bg-primary">
            {/* Header */}
            <ChatHeader
                otherUser={otherUser}
                isTyping={isTyping}
                recipientId={recipientId}
            />

            {/* KeyboardAvoidingView for Messages List & Input */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Messages List rendered directly from Zustand */}
                {messagesQuery.isLoading && messages.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Loader size="large" color="#6437ff" />
                    </View>
                ) : (
                    <View className="flex-1 relative">
                        <FlashList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={messageKeyExtractor}
                            inverted
                            {...({ estimatedItemSize: 80 } as any)}
                            style={{ flex: 1 }}
                            className="flex-1"
                            contentContainerStyle={listContentContainerStyle}
                            onEndReached={handleEndReached}
                            onEndReachedThreshold={0.3}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            ListFooterComponent={renderFooter}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderItem}
                        />

                        {/* Scroll to Bottom Floating Button with New Message Count */}
                        {(newMessagesCount > 0 || !isNearBottom) && (
                            <TouchableOpacity
                                onPress={scrollToBottom}
                                activeOpacity={0.8}
                                className="absolute bottom-3 right-4 bg-btn px-3 py-2 rounded-full flex-row items-center justify-center shadow-lg border border-white/20 z-30"
                            >
                                {newMessagesCount > 0 && (
                                    <View className="bg-red-500 rounded-full min-w-[20px] h-[20px] px-1.5 items-center justify-center mr-1.5">
                                        <Text className="text-white text-xs font-bold">
                                            {newMessagesCount > 99 ? "99+" : newMessagesCount}
                                        </Text>
                                    </View>
                                )}
                                <Ionicons name="chevron-down" size={20} color="#ffffff" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Typing Indicator */}
                <TypingIndicator
                    isTyping={isTyping}
                    username={otherUser?.username}
                />

                {/* Input Bar */}
                <ChatInputBar
                    text={text}
                    onChangeText={handleTextChange}
                    selectedImage={selectedImage}
                    onClearImage={() => setSelectedImage(null)}
                    onPickImage={handlePickImage}
                    onSendMessage={handleSendMessage}
                    uploadingImage={uploadingImage}
                    sendingSocketMsg={sendingSocketMsg}
                    isPending={sendMessageMutation.isPending}
                />

                {/* Fullscreen Image Preview Modal */}
                <ImagePreviewModal
                    previewImage={previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            </KeyboardAvoidingView>
        </View>
    );
};

export default ChatRoom;
