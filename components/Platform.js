import { View } from "react-native"

const Platform = (props) => {
  if (!props.body || !props.size) {
    console.log("Invalid props for Platform:", props)
    return null
  }

  const width = props.size[0]
  const height = props.size[1]
  const x = props.body.position.x - width / 2
  const y = props.body.position.y - height / 2

  // Special case for the air hockey table
  if (width > 100 && height > 100) {
    return (
      <View
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: width,
          height: height,
          backgroundColor: "#FFFFFF", // White professional air hockey table
          borderWidth: 10,
          borderColor: "#222222", // Dark border
          borderRadius: 20,
          zIndex: 1, // Make sure table is below mallets and puck
        }}
      >
        {/* Center line */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: height / 2 - 1,
            width: width,
            height: 2,
            backgroundColor: "#e74c3c", // Red line
          }}
        />

        {/* Center circle */}
        <View
          style={{
            position: "absolute",
            left: width / 2 - 40,
            top: height / 2 - 40,
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: "#e74c3c", // Red circle
            backgroundColor: "transparent",
          }}
        />

        {/* Corner circles */}
        <View
          style={{
            position: "absolute",
            left: 20,
            top: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: "#e74c3c",
            backgroundColor: "transparent",
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: "#e74c3c",
            backgroundColor: "transparent",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 20,
            bottom: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: "#e74c3c",
            backgroundColor: "transparent",
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: "#e74c3c",
            backgroundColor: "transparent",
          }}
        />

        {/* Defensive zones - semicircles in front of goals */}
        <View
          style={{
            position: "absolute",
            left: width / 2 - 75,
            top: 20,
            width: 150,
            height: 75,
            borderBottomLeftRadius: 75,
            borderBottomRightRadius: 75,
            borderWidth: 2,
            borderTopWidth: 0,
            borderColor: "#e74c3c",
            backgroundColor: "transparent",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: width / 2 - 75,
            bottom: 20,
            width: 150,
            height: 75,
            borderTopLeftRadius: 75,
            borderTopRightRadius: 75,
            borderWidth: 2,
            borderBottomWidth: 0,
            borderColor: "#e74c3c",
            backgroundColor: "transparent",
          }}
        />

        {/* Air holes pattern */}
        {Array(30)
          .fill(0)
          .map((_, i) => (
            <View key={`row-${i}`} style={{ flexDirection: "row" }}>
              {Array(30)
                .fill(0)
                .map((_, j) => (
                  <View
                    key={`dot-${i}-${j}`}
                    style={{
                      width: 2,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: "#888",
                      margin: width / 35,
                      opacity: 0.2,
                    }}
                  />
                ))}
            </View>
          ))}

        {/* Goals - Enhanced with neon effects and deeper design - FIXED ALIGNMENT */}
        <View
          style={{
            position: "absolute",
            left: (width - width * 0.3) / 2,
            top: -20, // Adjusted to align better with the table
            width: width * 0.3,
            height: 30, // Slightly smaller height
            backgroundColor: "rgba(52, 152, 219, 0.2)", // Blue player color with transparency
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            shadowColor: "#3498db", // Blue glow
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            borderWidth: 2,
            borderColor: "#3498db",
            borderTopWidth: 0,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: (width - width * 0.3) / 2,
            bottom: -20, // Adjusted to align better with the table
            width: width * 0.3,
            height: 30, // Slightly smaller height
            backgroundColor: "rgba(231, 76, 60, 0.2)", // Red player color with transparency
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            shadowColor: "#e74c3c", // Red glow
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            borderWidth: 2,
            borderColor: "#e74c3c",
            borderBottomWidth: 0,
          }}
        />
      </View>
    )
  }

  // For walls - make them neon and fancy
  const isWall = props.color === "transparent" && (width === 10 || height === 10)

  if (isWall) {
    const isVertical = width === 10
    const wallColor = "#00ffff" // Cyan neon color for walls

    return (
      <View
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: width,
          height: height,
          backgroundColor: "rgba(0, 255, 255, 0.2)", // Semi-transparent cyan
          shadowColor: wallColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 5,
          zIndex: 1,
        }}
      >
        {/* Inner glow line */}
        <View
          style={{
            position: "absolute",
            left: isVertical ? width / 2 - 1 : 0,
            top: isVertical ? 0 : height / 2 - 1,
            width: isVertical ? 2 : width,
            height: isVertical ? height : 2,
            backgroundColor: wallColor,
            shadowColor: wallColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 5,
          }}
        />
      </View>
    )
  }

  // For other platforms
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundColor: props.color || "transparent",
        zIndex: 1,
      }}
    />
  )
}

export default Platform

