import { useEffect, useRef } from "react";
import { StyleSheet, Animated, Easing, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const StartIndicator = ({ player, onComplete }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.parallel([
      // Slide in from top or bottom depending on player
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          easing: Easing.back(1.5),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Scale back to normal
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Hold for a moment then fade out
    setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (onComplete) onComplete();
      });
    }, 1500);
  }, [opacityAnim, scaleAnim, glowAnim, slideAnim, onComplete]);

  // Interpolate slide animation
  const slide = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [player === "player" ? -height : height, 0],
  });

  // Position based on player
  const position = player === "player2" ? { top: "25%" } : { bottom: "25%" };
  const color = player === "player2" ? "#3498db" : "#e74c3c"; // Blue for player 2, Red for player 1

  // Text based on player
  const startText =
    player === "player2" ? "PLAYER 2 START!" : "PLAYER 1 START!";

  // Determine if we need to rotate the indicator 180 degrees
  const isPlayer2 = player === "player2";
  const rotationStyle = isPlayer2 ? { transform: [{ rotate: "180deg" }] } : {};

  // Dynamic shadow radius based on animation
  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 20],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        position,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: slide }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: `${color}20`, // Semi-transparent background
            borderColor: color,
            shadowColor: color,
            shadowRadius: shadowRadius,
          },
          rotationStyle,
        ]}
      >
        <Animated.Text
          style={[
            styles.text,
            {
              textShadowColor: color,
              textShadowRadius: shadowRadius,
            },
          ]}
        >
          {startText}
        </Animated.Text>

        {/* Arrow indicator */}
        <Animated.View
          style={[
            styles.arrow,
            {
              borderTopColor: color,
              transform: [{ rotate: player === "player2" ? "180deg" : "0deg" }],
              shadowColor: color,
              shadowRadius: shadowRadius,
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
  },
  indicator: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    textShadowColor: "#00ffff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: 10,
    shadowColor: "#00ffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});

export default StartIndicator;
