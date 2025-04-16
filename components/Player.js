import { View } from "react-native"

const Player = (props) => {
  if (!props.body || !props.size) {
    console.log("Invalid props for Player:", props)
    return null
  }

  const width = props.size[0]
  const height = props.size[1]
  const x = props.body.position.x - width / 2
  const y = props.body.position.y - height / 2
  const isPlayerMallet = props.color === "#e74c3c" // Red is player

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        borderRadius: width / 2,
        backgroundColor: props.color || "#FFFFFF",
        zIndex: 5, // Make sure mallets are above table but below puck
        elevation: 5, // For Android
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
      }}
    >
      {/* Mallet handle/grip */}
      <View
        style={{
          position: "absolute",
          left: width * 0.25,
          top: width * 0.25,
          width: width * 0.5,
          height: height * 0.5,
          borderRadius: width * 0.25,
          backgroundColor: isPlayerMallet ? "#c0392b" : "#2980b9", // Darker shade for grip
        }}
      />

      {/* Mallet edge ring */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: width,
          height: height,
          borderRadius: width / 2,
          borderWidth: 3,
          borderColor: isPlayerMallet ? "#c0392b" : "#2980b9",
          backgroundColor: "transparent",
        }}
      />
    </View>
  )
}

export default Player

