// utils/scale.js
import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

const scale = size => (width / 375) * size; // 375 is base screen width (iPhone 11)
const verticalScale = size => (height / 812) * size; // 812 is base screen height
const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;

export { scale, verticalScale, moderateScale };