import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Button
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { buttonGlow } from "../../../constants/style.js";
import { useUser } from "../../../store/user.store.js";
import ProfileImageView from "../../../components/profile/ProfileImageView.jsx";
import ProfileActivityView from "../../../components/profile/ProfileActivityView.jsx";
import QuickButtons from "../../../components/profile/QuickButtons.jsx";

const { height: vh, width: vw } = Dimensions.get("window");

const Profile = () => {
    const username = useUser(state => state.username);

    return (
        <View
            overScrollMode={"always"}
            bounces={true}
            className="flex-1 bg-primary"
        >
            <ProfileImageView />
            <LinearGradient
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                }}
                colors={["#05070ddd", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.25 }}
            />

            <ProfileActivityView />
            <QuickButtons />
        </View>
    );
};

export default Profile;
