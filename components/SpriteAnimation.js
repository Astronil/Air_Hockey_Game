import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet } from "react-native";

const SpriteAnimation = ({
  spriteSheet,
  frameWidth,
  frameHeight,
  frameCount,
  spriteSheetWidth,
  spriteSheetHeight,
  fps = 7,
  loop = false,
  autoPlay = true,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Calculate frame positions based on the specific layout
  // 3 frames in first row, 3 in second row, 1 in last row
  const getFramePosition = (frameIndex) => {
    if (frameIndex < 3) {
      // First row (frames 0-2)
      return {
        x: frameIndex * frameWidth,
        y: 0,
      };
    } else if (frameIndex < 6) {
      // Second row (frames 3-5)
      return {
        x: (frameIndex - 3) * frameWidth,
        y: frameHeight,
      };
    } else {
      // Last row (frame 6)
      return {
        x: 0,
        y: 2 * frameHeight,
      };
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (autoPlay) {
      // Simple interval-based animation
      const interval = setInterval(() => {
        if (!isMountedRef.current) return;

        setCurrentFrame((prevFrame) => {
          const nextFrame = prevFrame + 1;
          if (nextFrame >= frameCount) {
            if (!loop) {
              clearInterval(interval);
              return frameCount - 1;
            }
            return 0;
          }
          return nextFrame;
        });
      }, 1000 / fps);

      timerRef.current = interval;
    }

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, fps, frameCount, loop]);

  // Get positions for current frame
  const currentPos = getFramePosition(currentFrame);

  return (
    <View
      style={[styles.container, { width: frameWidth, height: frameHeight }]}
    >
      <Image
        source={spriteSheet}
        style={[
          styles.spriteSheet,
          {
            width: spriteSheetWidth,
            height: spriteSheetHeight,
            left: -currentPos.x,
            top: -currentPos.y,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  spriteSheet: {
    position: "absolute",
  },
});

export default SpriteAnimation;
