import { TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";

const SheetBackdrop = ({ backdropStyle, onClose }) => {
    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                },
                backdropStyle
            ]}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.55)"
                }}
                activeOpacity={1}
                onPress={onClose}
            />
        </Animated.View>
    );
};

export default SheetBackdrop;
