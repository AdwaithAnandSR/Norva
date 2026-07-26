import {
    useQuery,
    useMutation,
    useInfiniteQuery
} from "@tanstack/react-query";
import {
    getConversations,
    getMessages,
    sendMessage,
    accessConversation,
    markAsRead,
    getChatContacts
} from "../../controllers/chat/chat.controller.js";

export const useConversations = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: getConversations
    });
};

export const useInfiniteMessages = conversationId => {
    return useInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: ({ pageParam }) =>
            getMessages({
                conversationId,
                before: pageParam,
                limit: 15
            }),
        initialPageParam: undefined,
        getNextPageParam: lastPage =>
            lastPage?.hasMore ? lastPage?.nextCursor : undefined,
        enabled: !!conversationId
    });
};

export const useSendMessage = () => {
    return useMutation({
        mutationFn: sendMessage
    });
};

export const useAccessConversation = () => {
    return useMutation({
        mutationFn: accessConversation
    });
};

export const useMarkAsRead = () => {
    return useMutation({
        mutationFn: markAsRead
    });
};

export const useChatContacts = (q = "") => {
    return useQuery({
        queryKey: ["chatContacts", q],
        queryFn: () => getChatContacts(q)
    });
};
