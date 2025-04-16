import { View } from "react-native"

const Ball = (props) => {
  if (!props.body || !props.size) {
    console.log("Invalid props for Ball:", props)
    return null
  }

  const width = props.size[0]
  const height = props.size[1]
  const x = props.body.position.x - width / 2
  const y = props.body.position.y - height / 2

  // Use the glowIntensity prop or default to 5
  const glowIntensity = props.glowIntensity || 5

  // Calculate glow opacity based on intensity
  const glowOpacity = Math.min(0.9, glowIntensity / 10)

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        borderRadius: width / 2,
        backgroundColor: "#000000", // Black puck
        zIndex: 10, // Make sure puck is above table
        elevation: 8, // For Android
        shadowColor: "#00ffff", // Cyan neon glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, // High opacity for strong shadow
        shadowRadius: glowIntensity * 0.5, // Inner shadow
      }}
    >
      {/* Inner circle for puck detail */}
      <View
        style={{
          position: "absolute",
          left: width * 0.2,
          top: height * 0.2,
          width: width * 0.6,
          height: height * 0.6,
          borderRadius: width * 0.3,
          backgroundColor: "#222222", // Dark gray
          opacity: 0.8,
        }}
      />

      {/* Puck edge */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: width,
          height: height,
          borderRadius: width / 2,
          borderWidth: 2,
          borderColor: "#444444",
          backgroundColor: "transparent",
        }}
      />

      {/* Neon glow overlay */}
      <View
        style={{
          position: "absolute",
          left: -glowIntensity,
          top: -glowIntensity,
          width: width + glowIntensity * 2,
          height: height + glowIntensity * 2,
          borderRadius: (width + glowIntensity * 2) / 2,
          backgroundColor: "transparent",
          borderWidth: 3,
          borderColor: `rgba(0, 255, 255, ${glowOpacity * 0.7})`,
          shadowColor: "#00ffff",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: glowIntensity * 2,
        }}
      />

      {/* Additional outer glow for more visibility against white background */}
      <View
        style={{
          position: "absolute",
          left: -glowIntensity * 2,
          top: -glowIntensity * 2,
          width: width + glowIntensity * 4,
          height: height + glowIntensity * 4,
          borderRadius: (width + glowIntensity * 4) / 2,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: `rgba(0, 255, 255, ${glowOpacity * 0.5})`,
          shadowColor: "#00ffff",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: glowIntensity * 3,
        }}
      />
    </View>
  )
}

export default Ball

