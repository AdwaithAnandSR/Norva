import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { height: vh, width: vw } = Dimensions.get("window");

const ProfileHeighlightsView = () => {
  return (            <View>
                <Text style={styles.highlightHeader}>Highlights</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.highlightsContainer}
                >
                    {[...Array(100)].map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.highlightItem}
                        ></TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

  );
};

const styles = StyleSheet.create({
  highlightHeader: {
        color: "white",
        fontSize: vw * 0.1,
        fontFamily: "LuckiestGuyRegular",
        marginTop: vh * 0.065,
        letterSpacing: 3
    },
    highlightsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: vw * 0.03
    },
    highlightItem: {
        width: vw * 0.25,
        height: vw * 0.25,
        borderRadius: vw * 0.5,
        borderWidth: 1,
        borderColor: "white"
    }
});

export default ProfileHeighlightsView;