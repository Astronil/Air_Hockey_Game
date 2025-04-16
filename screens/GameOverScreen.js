import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import NeonBorder from "../components/NeonBorder";
import Confetti from "../components/Confetti";

const { width, height } = Dimensions.get("window");

const GameOverScreen = ({
  score,
  isMultiplayer,
  restartGame,
  setGameState,
  GAME_STATES,
  playSound,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Determine winner
  const winner = score.player > score.player2 ? "player" : "player2";
  const winnerName = isMultiplayer
    ? winner === "player"
      ? "PLAYER 1"
      : "PLAYER 2"
    : winner === "player"
    ? "YOU"
    : "AI";

  // Winner color
  const winnerColor = winner === "player" ? "#e74c3c" : "#3498db";

  useEffect(() => {
    // Play game over sound
    playSound("gameOver");

    // Animate in
    Animated.sequence([
      // Fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Pop in
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePlayAgain = () => {
    // Play crowd sound
    playSound("crowd");
    restartGame();
  };

  const handleMainMenu = () => {
    setGameState(GAME_STATES.WELCOME);
  };

  return (
    <View style={styles.container}>
      <Confetti />

      <LinearGradient
        colors={["#121212", "#1a1a1a", "#121212"]}
        style={styles.background}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.title}>GAME OVER</Text>

        <View style={styles.winnerContainer}>
          <Animated.View
            style={[
              styles.winnerBox,
              {
                backgroundColor: `${winnerColor}20`,
                borderColor: winnerColor,
                shadowColor: winnerColor,
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
                shadowRadius: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 20],
                }),
              },
            ]}
          >
            <Text style={[styles.winnerText, { color: winnerColor }]}>
              {winnerName} WINS!
            </Text>

            <Text style={styles.scoreText}>
              {score.player} - {score.player2}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePlayAgain}>
            <NeonBorder color="#00ffff" />
            <Text style={styles.buttonText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleMainMenu}>
            <NeonBorder color="#ffffff" />
            <Text style={styles.buttonText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    width: width * 0.9,
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    textShadowColor: "#00ffff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  winnerContainer: {
    marginBottom: 40,
  },
  winnerBox: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
  },
  winnerText: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  scoreText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    width: width * 0.4,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default GameOverScreen;
