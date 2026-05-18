import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from "react-native";

const { height: vh, width: vw } = Dimensions.get("window");

const ProfileActivityView = () => {
    return (
        <View className="flex-row items-center gap-12 justify-start py-5 px-5">
            <TouchableOpacity>
                <Text style={styles.text} className="text-text text-xl font-bold">100</Text>
                <Text style={styles.text} className="text-text/60 text-md">Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[{ borderRightWidth: 2, borderLeftWidth: 2 }]}
            >
                <Text style={styles.text} className="text-text text-xl font-bold">100</Text>
                <Text style={styles.text} className="text-text/60 text-md">Following</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.text} className="text-text text-xl font-bold">100</Text>
                <Text style={styles.text} className="text-text/60 text-md">Followers</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: "SpaceMono"
    }
})

export default ProfileActivityView;
