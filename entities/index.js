import Matter from "matter-js"
import { Dimensions } from "react-native"
import Ball from "../components/Ball"
import Player from "../components/Player"
import Platform from "../components/Platform"

const { width, height } = Dimensions.get("window")

// Air hockey table dimensions
const TABLE_WIDTH = width * 0.9
const TABLE_HEIGHT = height * 0.8
const TABLE_X = (width - TABLE_WIDTH) / 2
const TABLE_Y = (height - TABLE_HEIGHT) / 2

// Puck and mallet dimensions
const PUCK_SIZE = 30
const MALLET_SIZE = 50

// Goal dimensions
const GOAL_WIDTH = TABLE_WIDTH * 0.3
const GOAL_HEIGHT = 20

export default (gameMode = "medium") => {
  console.log("Creating entities with game mode:", gameMode)

  // Create physics engine
  const engine = Matter.Engine.create({ enableSleeping: false })
  const world = engine.world

  // Disable gravity
  engine.world.gravity.y = 0

  // Create puck
  const puck = Matter.Bodies.circle(width / 2, height / 2, PUCK_SIZE / 2, {
    restitution: 0.95,
    friction: 0.01,
    frictionAir: 0.001,
    frictionStatic: 0.1,
    density: 0.1,
    inertia: Number.POSITIVE_INFINITY,
    label: "puck",
  })

  // Set initial puck velocity
  Matter.Body.setVelocity(puck, { x: 0, y: 0 })

  // Create player mallet
  const playerMallet = Matter.Bodies.circle(width / 2, TABLE_Y + TABLE_HEIGHT - MALLET_SIZE, MALLET_SIZE / 2, {
    isStatic: false,
    restitution: 0.7,
    friction: 0.05,
    frictionAir: 0.15,
    frictionStatic: 0.3,
    density: 0.5,
    inertia: Number.POSITIVE_INFINITY,
    label: "playerMallet",
  })

  // Create opponent mallet
  const opponentMallet = Matter.Bodies.circle(width / 2, TABLE_Y + MALLET_SIZE, MALLET_SIZE / 2, {
    isStatic: false,
    restitution: 0.7,
    friction: 0.05,
    frictionAir: 0.15,
    frictionStatic: 0.3,
    density: 0.5,
    inertia: Number.POSITIVE_INFINITY,
    label: "opponentMallet",
  })

  // Create table boundaries (walls)
  const leftWall = Matter.Bodies.rectangle(TABLE_X - 5, TABLE_Y + TABLE_HEIGHT / 2, 10, TABLE_HEIGHT, {
    isStatic: true,
    label: "leftWall",
  })

  const rightWall = Matter.Bodies.rectangle(TABLE_X + TABLE_WIDTH + 5, TABLE_Y + TABLE_HEIGHT / 2, 10, TABLE_HEIGHT, {
    isStatic: true,
    label: "rightWall",
  })

  const topWall = Matter.Bodies.rectangle(TABLE_X + TABLE_WIDTH / 2, TABLE_Y - 5, TABLE_WIDTH - GOAL_WIDTH, 10, {
    isStatic: true,
    label: "topWall",
  })

  const topLeftWall = Matter.Bodies.rectangle(
    TABLE_X + (TABLE_WIDTH - GOAL_WIDTH) / 4,
    TABLE_Y - 5,
    (TABLE_WIDTH - GOAL_WIDTH) / 2,
    10,
    { isStatic: true, label: "topLeftWall" },
  )

  const topRightWall = Matter.Bodies.rectangle(
    TABLE_X + TABLE_WIDTH - (TABLE_WIDTH - GOAL_WIDTH) / 4,
    TABLE_Y - 5,
    (TABLE_WIDTH - GOAL_WIDTH) / 2,
    10,
    { isStatic: true, label: "topRightWall" },
  )

  const bottomWall = Matter.Bodies.rectangle(
    TABLE_X + TABLE_WIDTH / 2,
    TABLE_Y + TABLE_HEIGHT + 5,
    TABLE_WIDTH - GOAL_WIDTH,
    10,
    { isStatic: true, label: "bottomWall" },
  )

  const bottomLeftWall = Matter.Bodies.rectangle(
    TABLE_X + (TABLE_WIDTH - GOAL_WIDTH) / 4,
    TABLE_Y + TABLE_HEIGHT + 5,
    (TABLE_WIDTH - GOAL_WIDTH) / 2,
    10,
    { isStatic: true, label: "bottomLeftWall" },
  )

  const bottomRightWall = Matter.Bodies.rectangle(
    TABLE_X + TABLE_WIDTH - (TABLE_WIDTH - GOAL_WIDTH) / 4,
    TABLE_Y + TABLE_HEIGHT + 5,
    (TABLE_WIDTH - GOAL_WIDTH) / 2,
    10,
    { isStatic: true, label: "bottomRightWall" },
  )

  // Add all bodies to the world
  Matter.World.add(world, [
    puck,
    playerMallet,
    opponentMallet,
    leftWall,
    rightWall,
    topLeftWall,
    topRightWall,
    bottomLeftWall,
    bottomRightWall,
  ])

  return {
    physics: {
      engine: engine,
      world: world,
      gameMode: gameMode,
    },
    puck: {
      body: puck,
      size: [PUCK_SIZE, PUCK_SIZE],
      color: "#f39c12", // Orange puck
      renderer: Ball,
    },
    playerMallet: {
      body: playerMallet,
      size: [MALLET_SIZE, MALLET_SIZE],
      color: "#e74c3c", // Red mallet
      renderer: Player,
    },
    opponentMallet: {
      body: opponentMallet,
      size: [MALLET_SIZE, MALLET_SIZE],
      color: "#3498db", // Blue mallet
      renderer: Player,
    },
    leftWall: {
      body: leftWall,
      size: [10, TABLE_HEIGHT],
      color: "transparent",
      renderer: Platform,
    },
    rightWall: {
      body: rightWall,
      size: [10, TABLE_HEIGHT],
      color: "transparent",
      renderer: Platform,
    },
    topLeftWall: {
      body: topLeftWall,
      size: [(TABLE_WIDTH - GOAL_WIDTH) / 2, 10],
      color: "transparent",
      renderer: Platform,
    },
    topRightWall: {
      body: topRightWall,
      size: [(TABLE_WIDTH - GOAL_WIDTH) / 2, 10],
      color: "transparent",
      renderer: Platform,
    },
    bottomLeftWall: {
      body: bottomLeftWall,
      size: [(TABLE_WIDTH - GOAL_WIDTH) / 2, 10],
      color: "transparent",
      renderer: Platform,
    },
    bottomRightWall: {
      body: bottomRightWall,
      size: [(TABLE_WIDTH - GOAL_WIDTH) / 2, 10],
      color: "transparent",
      renderer: Platform,
    },
    table: {
      body: {
        position: {
          x: TABLE_X + TABLE_WIDTH / 2,
          y: TABLE_Y + TABLE_HEIGHT / 2,
        },
      },
      size: [TABLE_WIDTH, TABLE_HEIGHT],
      color: "#FFFFFF", // White table
      renderer: Platform,
    },
  }
}

