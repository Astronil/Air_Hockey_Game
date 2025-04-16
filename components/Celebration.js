import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import SpriteAnimation from "./SpriteAnimation";

const { width } = Dimensions.get("window");

const Celebration = ({ player, isGameOver = false, onComplete, playSound }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Play crowd sound when celebration appears
    if (typeof playSound === "function") {
      setTimeout(() => playSound("crowd"), 0);
    }

    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5);

    // Simple fade in and scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold for a moment
      setTimeout(
        () => {
          // Fade out and scale down
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.5,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (onComplete) onComplete();
          });
        },
        isGameOver ? 3000 : 2000
      );
    });
  }, [isGameOver, onComplete, fadeAnim, scaleAnim, playSound]);

  // Message based on game state
  const message = isGameOver
    ? `${player === "player" ? "PLAYER 1" : "PLAYER 2"} WINS!`
    : `${player === "player" ? "PLAYER 1" : "PLAYER 2"} SCORES!`;

  // Color based on player
  const color = player === "player" ? "#e74c3c" : "#3498db";

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.celebrationBox,
          {
            backgroundColor: `${color}20`,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            borderColor: color,
          },
        ]}
      >
        <Text style={[styles.celebrationText, { color: color }]}>
          {message}
        </Text>

        <View style={styles.characterContainer}>
          <SpriteAnimation
            spriteSheet={require("../assets/sprites/Screenshot 2025-04-07 132745.png")}
            frameWidth={200}
            frameHeight={300}
            frameCount={7}
            spriteSheetWidth={800}
            spriteSheetHeight={250}
            fps={7}
            loop={false}
            autoPlay={true}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  celebrationBox: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 300,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  celebrationText: {
    fontSize: 42,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    marginBottom: 30,
  },
  characterContainer: {
    width: 200,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Celebration;
