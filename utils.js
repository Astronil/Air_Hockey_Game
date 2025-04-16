import { Dimensions } from "react-native"

const { width, height } = Dimensions.get("window")

// Game states
export const GAME_STATES = {
  SPLASH: "splash",
  WELCOME: "welcome",
  PLAYING: "playing",
  GAME_OVER: "game_over",
}

// Generate random puck velocity
export const randomPuckVelocity = (direction = "random") => {
  const speed = 4
  const xDirection = Math.random() > 0.5 ? 1 : -1
  let yDirection

  if (direction === "up") {
    yDirection = -1
  } else if (direction === "down") {
    yDirection = 1
  } else {
    yDirection = Math.random() > 0.5 ? 1 : -1
  }

  return {
    x: xDirection * (speed / 2 + (Math.random() * speed) / 2),
    y: yDirection * speed,
  }
}

// Calculate distance between two points
export const distance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Generate random number within range
export const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Clamp value between min and max
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

// AI mallet movement logic
export const getMalletMovement = (difficulty, puck, mallet) => {
  // Base movement speed and parameters
  let speed
  let reactionDelay
  let errorMargin
  let defensivePosition

  switch (difficulty) {
    case "easy":
      speed = 5
      reactionDelay = 10
      errorMargin = 40
      defensivePosition = 0.7 // How far back the AI stays (0-1)
      break
    case "medium":
      speed = 8
      reactionDelay = 5
      errorMargin = 20
      defensivePosition = 0.5
      break
    case "hard":
      speed = 12
      reactionDelay = 2
      errorMargin = 10
      defensivePosition = 0.3
      break
    default:
      speed = 8
      reactionDelay = 5
      errorMargin = 20
      defensivePosition = 0.5
  }

  // Add randomness to AI decision making
  if (Math.random() < 1 / reactionDelay) {
    // Predict where the puck will be
    const puckVelocity = puck.velocity || { x: 0, y: 0 }
    const isPuckMovingTowardsAI = puckVelocity.y < 0

    // Target position calculation
    let targetX, targetY

    if (isPuckMovingTowardsAI && Math.abs(puckVelocity.y) > 1) {
      // Puck is moving towards AI - intercept it
      const timeToIntercept = Math.abs((mallet.position.y - puck.position.y) / puckVelocity.y)
      targetX = puck.position.x + puckVelocity.x * timeToIntercept

      // Add some randomness to make AI imperfect
      targetX += (Math.random() * 2 - 1) * errorMargin

      // Keep target within table bounds
      const TABLE_WIDTH = Dimensions.get("window").width * 0.9
      const TABLE_X = (Dimensions.get("window").width - TABLE_WIDTH) / 2
      targetX = Math.max(TABLE_X + 50 / 2, Math.min(TABLE_X + TABLE_WIDTH - 50 / 2, targetX))

      // Move forward to intercept
      targetY = mallet.position.y + speed
    } else {
      // Puck is moving away or slow - return to defensive position
      targetX = Dimensions.get("window").width / 2

      // Add some randomness to position
      targetX += (Math.random() * 2 - 1) * (errorMargin * 2)

      // Defensive position based on difficulty
      const TABLE_HEIGHT = Dimensions.get("window").height * 0.8
      const TABLE_Y = (Dimensions.get("window").height - TABLE_HEIGHT) / 2
      targetY = TABLE_Y + TABLE_HEIGHT * defensivePosition
    }

    // Calculate movement vector
    const dx = targetX - mallet.position.x
    const dy = targetY - mallet.position.y

    // Normalize and scale by speed
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > 0) {
      return {
        x: (dx / distance) * Math.min(speed, distance),
        y: (dy / distance) * Math.min(speed, distance),
      }
    }
  }

  // Default: no movement
  return { x: 0, y: 0 }
}

