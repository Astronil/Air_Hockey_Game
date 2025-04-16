import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

const SplashScreen = ({ loading }) => {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [starAnimations, setStarAnimations] = useState([]);

  // Initialize star animations
  useEffect(() => {
    const newStarAnimations = [];
    for (let i = 0; i < 30; i++) {
      newStarAnimations.push(new Animated.Value(0));
    }
    setStarAnimations(newStarAnimations);

    // Start animations for each star
    newStarAnimations.forEach((anim, i) => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 5000 + Math.random() * 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    });
  }, []);

  useEffect(() => {
    // Animate logo and text
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Update progress animation based on loading value
    Animated.timing(progressAnim, {
      toValue: loading / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [loading, logoAnim, textAnim, progressAnim]);

  return (
    <View style={styles.container}>
      {/* Animated background elements */}
      {starAnimations.map((animValue, i) => {
        const size = 2 + Math.random() * 5;

        return (
          <Animated.View
            key={i}
            style={[
              styles.star,
              {
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.2, 1, 0.2],
                }),
              },
            ]}
          />
        );
      })}

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoPlaceholder,
          {
            transform: [
              { scale: logoAnim },
              {
                rotate: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["-90deg", "0deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.logoText}>🏒</Text>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textAnim,
            transform: [
              {
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        AIR HOCKEY CHAMPION
      </Animated.Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <Animated.Text style={[styles.loadingText, { opacity: textAnim }]}>
        Loading... {loading}%
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  star: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: "#e74c3c",
    borderRadius: 75,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#fff",
    textShadowColor: "rgba(231, 76, 60, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  progressContainer: {
    width: "80%",
    height: 20,
    backgroundColor: "#2c3e50",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#e74c3c",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
});

export default SplashScreen;
