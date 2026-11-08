import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { EaseView } from "react-native-ease";

import InitialsAvatar from "./InitialsAvatar.jsx";
import FollowButton from "../feed/FollowButton.jsx";
import AnimatedPressable from "../common/AnimatedPressable.jsx";

import { useUser } from "../../store/user.store.js";

const UserSearchRow = ({ user, onPress, onRemove }) => {
    const userId = useUser(state => state.userId);

    return (
        <EaseView
            initialAnimate={{ opacity: 0, translateX: -14 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            useHardwareLayer={true}
        >
            <AnimatedPressable
                onPress={() => onPress(user)}
                scaleTo={0.97}
                className="flex-row items-center px-4 py-2.5"
            >
                <InitialsAvatar
                    fullname={user.fullname || user.username}
                    profileImage={user.profileImage}
                />

                <View className="flex-1 ml-3">
                    <Text
                        numberOfLines={1}
                        className="text-text text-[15px]"
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                    >
                        {user.fullname || user.username}
                    </Text>
                    <Text
                        numberOfLines={1}
                        className="text-text-secondary/50 text-[12px]"
                        style={{ fontFamily: "SpaceMono" }}
                    >
                        @{user.username}
                    </Text>
                </View>

                {userId !== user._id &&
                    (onRemove ? (
                        <TouchableOpacity
                            onPress={() => onRemove(user._id)}
                            hitSlop={10}
                            className="pl-3"
                        >
                            <Feather
                                name="x"
                                size={18}
                                color="rgba(196,196,224,0.4)"
                            />
                        </TouchableOpacity>
                    ) : (
                        <FollowButton userId={user._id} />
                    ))}
            </AnimatedPressable>
        </EaseView>
    );
};

export default UserSearchRow;
