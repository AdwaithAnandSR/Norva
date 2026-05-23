import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function App() {
    return (
        <View style={styles.container}>
            {/* Top Text (Over the image) */}
            <View style={styles.overlay}>
                <Text style={styles.textTop}>This is top text</Text>
            </View>

            {/* Image */}
            <Image
                source={{
                    uri: "https://images.media.io/images2023/photo-enhance/banner-after.png"
                }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Bottom Text (Below the image) */}
            <Text style={styles.textBottom}>This is bottom text</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff"
    },
    image: {
        width: 300,
        height: 200,
        borderRadius: 10
    },
    overlay: {
        position: "absolute",
        top: "35%", // adjust as needed
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 2
    },
    textTop: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        backgroundColor: "rgba(0,0,0,0.4)", // Optional: background blur look
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    textBottom: {
        marginTop: 10,
        fontSize: 18,
        color: "#333"
    }
});
