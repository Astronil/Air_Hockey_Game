import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

const RippleEffect = ({ position, color = "#00ffff", onComplete }) => {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (!position) return;

    // Create a new ripple with unique ID
    const newRipple = {
      id: Date.now(),
      position: { x: position.x, y: position.y },
      scale: new Animated.Value(0.1),
      opacity: new Animated.Value(1),
      color: getRandomNeonColor(color),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Animate the ripple
    Animated.parallel([
      Animated.timing(newRipple.scale, {
        toValue: 5, // Larger scale for more dramatic effect
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(newRipple.opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remove this ripple after animation completes
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      if (onComplete) onComplete();
    });
  }, [position, color, onComplete]);

  // Generate random neon color
  const getRandomNeonColor = (baseColor) => {
    const neonColors = [
      "#00ffff", // Cyan
      "#ff00ff", // Magenta
      "#ffff00", // Yellow
      "#00ff00", // Green
      "#ff9500", // Orange
      "#ff00aa", // Pink
    ];

    return (
      baseColor || neonColors[Math.floor(Math.random() * neonColors.length)]
    );
  };

  return (
    <>
      {ripples.map((ripple) => (
        <Animated.View
          key={ripple.id}
          style={[
            styles.ripple,
            {
              left: ripple.position.x,
              top: ripple.position.y,
              backgroundColor: `${ripple.color}10`, // Very transparent
              borderColor: ripple.color,
              transform: [{ scale: ripple.scale }],
              opacity: ripple.opacity,
            },
          ]}
        >
          {/* Inner glow */}
          <View
            style={[styles.innerRipple, { backgroundColor: ripple.color }]}
          />
        </Animated.View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  ripple: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "#00ffff",
    shadowColor: "#00ffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  innerRipple: {
    width: "50%",
    height: "50%",
    borderRadius: 100,
    backgroundColor: "#00ffff",
    shadowColor: "#00ffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});

export default RippleEffect;
