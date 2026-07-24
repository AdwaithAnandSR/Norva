import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

import Loader from "../../../components/common/Loader";
import SearchBar from "../../../components/search/SearchBar.jsx";
import UserSearchRow from "../../../components/search/UserSearchRow.jsx";

import { useDebouncedValue } from "../../../hooks/useDebouncedValue.js";
import {
    useSearchUsers,
    useRecentSearches,
    useAddRecentSearch,
    useRemoveRecentSearch,
    useClearRecentSearches
} from "../../../hooks/user/useSearch.js";

const SectionHeader = ({ label, action }) => (
    <View className="flex-row items-center justify-between px-4 mb-2">
        <Text
            style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.5
            }}
            className="text-text-secondary/50"
        >
            {label}
        </Text>
        {action}
    </View>
);

const EmptyState = ({ emoji, title, subtitle }) => (
    <View className="flex-1 pt-20 items-center px-10">
        <Text className="text-[40px] mb-3">{emoji}</Text>
        <Text
            className="text-text text-[18px] text-center mb-2"
            style={{ fontFamily: "WinkyRoughExtraBold" }}
        >
            {title}
        </Text>
        {subtitle && (
            <Text
                className="text-text/50 text-[13px] text-center leading-5"
                style={{ fontFamily: "SpaceMono" }}
            >
                {subtitle}
            </Text>
        )}
    </View>
);

const Search = () => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 350);
    const isSearching = debouncedQuery.trim().length > 0;

    const searchResults = useSearchUsers(debouncedQuery);
    const recentSearches = useRecentSearches();

    const addRecent = useAddRecentSearch();
    const removeRecent = useRemoveRecentSearch();
    const clearRecent = useClearRecentSearches();
    
    const handleSelectUser = (user: { _id: string }) => {
        addRecent.mutate(user._id);
        router.push(`/UserProfile/${user._id}`);
    };

    const results = searchResults.data?.users ?? [];
    const recents = recentSearches.data?.users ?? [];

    return (
        <View className="flex-1 bg-primary pt-12">
            <SearchBar
                value={query}
                onChangeText={setQuery}
                onClear={() => setQuery("")}
            />

            {isSearching ? (
                <FlashList
                    data={results}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <UserSearchRow user={item} onPress={handleSelectUser} />
                    )}
                    estimatedItemSize={64}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingTop: 12,
                        paddingBottom: 150
                    }}
                    ListEmptyComponent={
                        searchResults.isLoading ? (
                            <View className="pt-16 items-center">
                                <Loader size="small" />
                            </View>
                        ) : (
                            <EmptyState
                                emoji="🔭"
                                title="No one found"
                                subtitle={`Nobody matches "${debouncedQuery.trim()}"`}
                            />
                        )
                    }
                />
            ) : (
                <FlashList
                    data={recents}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <UserSearchRow
                            user={item}
                            onPress={handleSelectUser}
                            onRemove={id => removeRecent.mutate(id)}
                        />
                    )}
                    estimatedItemSize={64}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingTop: 12,
                        paddingBottom: 150
                    }}
                    ListHeaderComponent={
                        recents.length > 0 ? (
                            <SectionHeader
                                label="RECENT"
                                action={
                                    <TouchableOpacity
                                        onPress={() => clearRecent.mutate()}
                                    >
                                        <Text
                                            className="text-btn"
                                            style={{
                                                fontFamily: "SpaceMono",
                                                fontSize: 12
                                            }}
                                        >
                                            Clear all
                                        </Text>
                                    </TouchableOpacity>
                                }
                            />
                        ) : null
                    }
                    ListEmptyComponent={
                        recentSearches.isLoading ? (
                            <View className="pt-16 items-center">
                                <Loader size="small" />
                            </View>
                        ) : (
                            <EmptyState
                                emoji="🔎"
                                title="Find people"
                                subtitle="Search by name or username to discover people on Norva."
                            />
                        )
                    }
                />
            )}
        </View>
    );
};

export default Search;
