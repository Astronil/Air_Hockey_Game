import { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";

const NeonBorder = ({ color = "#00ffff", width = 2, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const glowIntensity = pulseAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [5, 15],
  });

  return (
    <Animated.View
      style={[
        styles.border,
        {
          borderColor: color,
          borderWidth: width,
          shadowColor: color,
          shadowRadius: glowIntensity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
  },
});

export default NeonBorder;
