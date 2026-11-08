import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
    searchUsers,
    getRecentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches
} from "../../controllers/user/search.controller.js";

// Live search — only fires once the (debounced) query is non-empty.
export const useSearchUsers = query => {
    const trimmed = query.trim();

    return useQuery({
        queryKey: ["userSearch", trimmed],
        queryFn: () => searchUsers(trimmed),
        enabled: trimmed.length > 0,
        staleTime: 1000 * 30,
        placeholderData: prev => prev
    });
};

export const useRecentSearches = () =>
    useQuery({
        queryKey: ["userSearch", "recent"],
        queryFn: getRecentSearches,
        staleTime: 1000 * 30
    });

export const useAddRecentSearch = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: addRecentSearch,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["userSearch", "recent"] })
    });
};

export const useRemoveRecentSearch = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: removeRecentSearch,

        onMutate: async userId => {
            await qc.cancelQueries({ queryKey: ["userSearch", "recent"] });

            qc.setQueryData(["userSearch", "recent"], old => {
                if (!old) return old;

                return {
                    ...old,
                    users: old.users.filter(u => u._id !== userId)
                };
            });
        },

        onError: (_err, _userId, context) => {
            if (context?.previous)
                qc.setQueryData(["userSearch", "recent"], context.previous);
        },

        onSettled: () =>
            qc.invalidateQueries({ queryKey: ["userSearch", "recent"] })
    });
};

export const useClearRecentSearches = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: clearRecentSearches,

        onMutate: async () => {
            await qc.cancelQueries({ queryKey: ["userSearch", "recent"] });
            const previous = qc.getQueryData(["userSearch", "recent"]);
            qc.setQueryData(["userSearch", "recent"], old =>
                old ? { ...old, users: [] } : old
            );
            return { previous };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous)
                qc.setQueryData(["userSearch", "recent"], context.previous);
        },

        onSettled: () =>
            qc.invalidateQueries({ queryKey: ["userSearch", "recent"] })
    });
};
