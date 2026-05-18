import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export const pickImage = async () => {
    const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
        Alert.alert(
            "Permission required",
            "Permission to access the media library is required."
        );
        return { success: false };
    }

    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1
    });

    if (!result.canceled) return { success: true, result };

    return { success: false };
};
