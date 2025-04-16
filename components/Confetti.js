import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Create confetti particles
    const newParticles = [];
    const colors = [
      "#e74c3c",
      "#3498db",
      "#f1c40f",
      "#2ecc71",
      "#9b59b6",
      "#e67e22",
    ];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(-50 - Math.random() * 100),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 10 + Math.random() * 10,
        shape: Math.random() > 0.5 ? "circle" : "square",
      });
    }

    setParticles(newParticles);

    // Animate each particle
    newParticles.forEach((particle) => {
      const duration = 3000 + Math.random() * 2000;

      Animated.parallel([
        Animated.timing(particle.y, {
          toValue: height + 100,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotate, {
          toValue: 10,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => {
        const rotate = particle.rotate.interpolate({
          inputRange: [0, 10],
          outputRange: [
            "0deg",
            `${Math.random() > 0.5 ? "" : "-"}${360 + Math.random() * 720}deg`,
          ],
        });

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius:
                  particle.shape === "circle" ? particle.size / 2 : 0,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { rotate },
                  { scale: particle.scale },
                ],
              },
            ]}
          />
        );
      })}
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
    zIndex: 99,
  },
  particle: {
    position: "absolute",
  },
});

export default Confetti;
