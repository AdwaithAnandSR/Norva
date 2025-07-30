import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from "react-native";

const { height: vh, width: vw } = Dimensions.get("window");

const ProfileActivityView = () => {
    return (
        <View style={styles.activityInfo}>
            <TouchableOpacity style={styles.activityInfoItem}>
                <Text style={styles.text}>Posts</Text>
                <Text style={styles.text}>100</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.activityInfoItem,
                    { borderRightWidth: 2, borderLeftWidth: 2 }
                ]}
            >
                <Text style={styles.text}>Following</Text>
                <Text style={styles.text}>100</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activityInfoItem}>
                <Text style={styles.text}>Followers</Text>
                <Text style={styles.text}>100</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    activityInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: vw * 0.03
    },
    activityInfoItem: {
        flex: 1,
        borderColor: "white"
    },
    text: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center"
    }
});

export default ProfileActivityView;
