import { View, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const SearchBar = ({ value, onChangeText, onClear, autoFocus }) => (
    <View
        className="flex-row items-center bg-card-selected border border-btn/20 rounded-2xl px-4"
        style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 4 }}
    >
        <Feather name="search" size={16} color="rgba(196,196,224,0.4)" />

        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Search people"
            placeholderTextColor="rgba(196,196,224,0.3)"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={autoFocus}
            className="flex-1 text-text"
            style={{
                fontFamily: "SpaceMono",
                fontSize: 14,
                paddingVertical: 12,
                paddingLeft: 10
            }}
        />

        {value.length > 0 && (
            <TouchableOpacity onPress={onClear} hitSlop={10}>
                <Feather name="x-circle" size={16} color="rgba(196,196,224,0.4)" />
            </TouchableOpacity>
        )}
    </View>
);

export default SearchBar;
