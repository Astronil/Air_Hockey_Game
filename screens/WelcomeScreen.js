import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import NeonBorder from "../components/NeonBorder";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = ({
  setDifficulty,
  difficulty,
  startGame,
  error,
  playSound,
}) => {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const [bgElementsAnimValues, setBgElementsAnimValues] = useState([]);

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize background element animations
  useEffect(() => {
    // Create new animation values
    const newAnimValues = [];
    for (let i = 0; i < 20; i++) {
      newAnimValues.push(new Animated.Value(0));
    }
    setBgElementsAnimValues(newAnimValues);

    // Start animations after values are set
    newAnimValues.forEach((_, i) => {
      startBgElementAnimation(i, newAnimValues);
    });
  }, []);

  const startBgElementAnimation = (i, animValues) => {
    if (!animValues || !animValues[i]) return;

    Animated.loop(
      Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(animValues[i], {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animValues[i], {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Logo animation
  const logoRotate = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Animated background elements */}
      {[...Array(20)].map((_, i) => {
        const size = 5 + Math.random() * 15;

        return (
          <Animated.View
            key={i}
            style={[
              styles.bgElement,
              {
                width: size,
                height: size,
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: bgElementsAnimValues[i]
                  ? bgElementsAnimValues[i].interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.7, 0],
                    })
                  : 0,
                backgroundColor: ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71"][
                  Math.floor(Math.random() * 4)
                ],
              },
            ]}
          />
        );
      })}

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoAnim }, { rotate: logoRotate }],
          },
        ]}
      >
        <NeonBorder color="#00ffff" width={3} />
        <Text style={styles.logoText}>🏒</Text>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleAnim,
            transform: [
              {
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        AIR HOCKEY CHAMPION
      </Animated.Text>

      <Animated.Text
        style={[
          styles.creatorText,
          {
            opacity: titleAnim,
          },
        ]}
      >
        Created by Anil Poudel
      </Animated.Text>

      {/* Instructions */}
      <Animated.View
        style={[
          styles.instructionsContainer,
          {
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.instructionsTitle}>How to Play:</Text>
        <Text style={styles.instructionsText}>
          Swipe to move your mallet and hit the puck.{"\n"}
          Score by getting the puck into your opponent's goal.{"\n"}
          First to score 7 points wins!
        </Text>

        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyTitle}>AI Difficulty:</Text>
          <View style={styles.difficultyButtons}>
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                difficulty === "easy" && styles.selectedButton,
              ]}
              onPress={() => setDifficulty("easy")}
            >
              <NeonBorder
                color={difficulty === "easy" ? "#00ffff" : "transparent"}
              />
              <Text style={styles.buttonText}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                difficulty === "medium" && styles.selectedButton,
              ]}
              onPress={() => setDifficulty("medium")}
            >
              <NeonBorder
                color={difficulty === "medium" ? "#00ffff" : "transparent"}
              />
              <Text style={styles.buttonText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                difficulty === "hard" && styles.selectedButton,
              ]}
              onPress={() => setDifficulty("hard")}
            >
              <NeonBorder
                color={difficulty === "hard" ? "#00ffff" : "transparent"}
              />
              <Text style={styles.buttonText}>Hard</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.playButtonsContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              // Removed crowd sound
              startGame("single");
            }}
          >
            <NeonBorder color="#00ffff" />
            <Text style={styles.playButtonText}>Single Player</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              // Removed crowd sound
              startGame("multiplayer");
            }}
          >
            <NeonBorder color="#00ffff" />
            <Text style={styles.playButtonText}>Two Players</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  bgElement: {
    position: "absolute",
    borderRadius: 10,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
    textShadowColor: "rgba(231, 76, 60, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  creatorText: {
    fontSize: 16,
    marginBottom: 30,
    color: "#bbb",
  },
  instructionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  instructionsText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
    lineHeight: 24,
  },
  difficultyContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  difficultyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  difficultyButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgba(44, 62, 80, 0.5)",
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    overflow: "hidden",
  },
  selectedButton: {
    backgroundColor: "rgba(231, 76, 60, 0.5)",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  playButtonsContainer: {
    width: "100%",
    alignItems: "center",
  },
  playButton: {
    width: "80%",
    paddingVertical: 15,
    backgroundColor: "rgba(231, 76, 60, 0.2)",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  playButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 5,
  },
  errorText: {
    color: "#FFF",
    textAlign: "center",
  },
});

export default WelcomeScreen;
