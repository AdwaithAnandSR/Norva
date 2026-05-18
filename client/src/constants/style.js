import { StyleSheet } from "react-native";

export const buttonGlow = StyleSheet.create({
    boxShadow: `
        inset 0px 2px 8px rgba(160,120,255,0.08),
        inset 0px -4px 20px rgba(80,20,255,0.22)
    `,
    backgroundColor: "#0b0615"
});

export const orangeGlow = StyleSheet.create({
    boxShadow: `
        inset 0px 2px 8px rgba(255,156,120,0.08),
        inset 0px -4px 20px rgba(255,38,20,0.22)
    `,
    backgroundColor: "#150b06"
});

export const greenGlow = StyleSheet.create({
    boxShadow: `
        inset 0px 2px 8px rgba(154,255,120,0.08),
        inset 0px -4px 20px rgba(79,255,20,0.22)
    `,
    backgroundColor: "#05130e"
});
