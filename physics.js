import Matter from "matter-js";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Air hockey table dimensions
const TABLE_WIDTH = width * 0.9;
const TABLE_HEIGHT = height * 0.8;
const TABLE_X = (width - TABLE_WIDTH) / 2;
const TABLE_Y = (height - TABLE_HEIGHT) / 2;

// Puck and mallet dimensions
const PUCK_SIZE = 30;
const MALLET_SIZE = 50;

// Goal dimensions
const GOAL_WIDTH = TABLE_WIDTH * 0.3;
const GOAL_HEIGHT = 20;

let puckSpeedMultiplier = 1;
let consecutiveHits = 0;
let lastMalletHit = null;
let lastWallCollision = 0; // Timestamp of last wall collision
let lastMalletHitTime = 0; // Timestamp of last mallet hit

// Add a puckGlowIntensity variable to track glow state
let puckGlowIntensity = 5; // Default glow intensity
const MAX_GLOW_INTENSITY = 20; // Increased maximum intensity
const GLOW_DECAY_RATE = 0.99; // Slower decay rate so glow lasts longer

const Physics = (entities, { touches, time, dispatch }) => {
  const engine = entities.physics.engine;
  const world = engine.world;
  const puck = entities.puck.body;
  const playerMallet = entities.playerMallet.body;
  const opponentMallet = entities.opponentMallet.body;
  const gameMode = entities.physics.gameMode;

  // Decay the puck glow over time
  if (puckGlowIntensity > 5) {
    puckGlowIntensity *= GLOW_DECAY_RATE;
    if (puckGlowIntensity < 5) puckGlowIntensity = 5;

    // Update the puck's glow intensity
    entities.puck.glowIntensity = puckGlowIntensity;
  }

  // Process touch events for player mallet
  touches
    .filter((t) => t.type === "move")
    .forEach((t) => {
      if (t.event.pageY > height / 2) {
        // Player mallet control (bottom half of screen)
        Matter.Body.setPosition(playerMallet, {
          x: t.event.pageX,
          y: Math.min(t.event.pageY, height - 100), // Keep mallet in player's half
        });
      } else if (gameMode === "multiplayer") {
        // Second player mallet control (top half of screen in multiplayer)
        Matter.Body.setPosition(opponentMallet, {
          x: t.event.pageX,
          y: Math.max(t.event.pageY, 100), // Keep mallet in opponent's half
        });
      }
    });

  // AI in single player mode
  if (gameMode !== "multiplayer") {
    const aiDifficulty = gameMode; // 'easy', 'medium', or 'hard'
    const aiMovement = getMalletMovement(aiDifficulty, puck, opponentMallet);

    Matter.Body.setPosition(opponentMallet, {
      x: opponentMallet.position.x + aiMovement.x,
      y: Math.min(
        Math.max(
          opponentMallet.position.y + aiMovement.y,
          TABLE_Y + MALLET_SIZE / 2
        ),
        TABLE_Y + TABLE_HEIGHT / 2 - MALLET_SIZE / 2
      ),
    });
  }

  // Keep mallets within table bounds
  const keepMalletInBounds = (mallet) => {
    const halfMalletSize = MALLET_SIZE / 2;

    // X-axis bounds
    if (mallet.position.x < TABLE_X + halfMalletSize) {
      Matter.Body.setPosition(mallet, {
        x: TABLE_X + halfMalletSize,
        y: mallet.position.y,
      });
    }

    if (mallet.position.x > TABLE_X + TABLE_WIDTH - halfMalletSize) {
      Matter.Body.setPosition(mallet, {
        x: TABLE_X + TABLE_WIDTH - halfMalletSize,
        y: mallet.position.y,
      });
    }

    // Y-axis bounds - keep player mallet in bottom half
    if (mallet === playerMallet) {
      if (mallet.position.y < TABLE_Y + TABLE_HEIGHT / 2) {
        Matter.Body.setPosition(mallet, {
          x: mallet.position.x,
          y: TABLE_Y + TABLE_HEIGHT / 2,
        });
      }

      if (mallet.position.y > TABLE_Y + TABLE_HEIGHT - halfMalletSize) {
        Matter.Body.setPosition(mallet, {
          x: mallet.position.x,
          y: TABLE_Y + TABLE_HEIGHT - halfMalletSize,
        });
      }
    }

    // Y-axis bounds - keep opponent mallet in top half
    if (mallet === opponentMallet) {
      if (mallet.position.y < TABLE_Y + halfMalletSize) {
        Matter.Body.setPosition(mallet, {
          x: mallet.position.x,
          y: TABLE_Y + halfMalletSize,
        });
      }

      if (mallet.position.y > TABLE_Y + TABLE_HEIGHT / 2) {
        Matter.Body.setPosition(mallet, {
          x: mallet.position.x,
          y: TABLE_Y + TABLE_HEIGHT / 2,
        });
      }
    }
  };

  keepMalletInBounds(playerMallet);
  keepMalletInBounds(opponentMallet);

  // Check for scoring (puck in goal)
  const goalLeft = TABLE_X + (TABLE_WIDTH - GOAL_WIDTH) / 2;
  const goalRight = goalLeft + GOAL_WIDTH;

  // Check if puck is in top goal (player scores)
  if (
    puck.position.y <= TABLE_Y &&
    puck.position.x > goalLeft &&
    puck.position.x < goalRight
  ) {
    console.log("Player scores!");
    dispatch({ type: "score", player: "player" });

    // Player 1 scored, so player 2 (top) starts with the puck
    resetPuck(puck, "player2", dispatch);

    puckSpeedMultiplier = 1;
    consecutiveHits = 0;
    lastMalletHit = null;
    return entities;
  }
  // Check if puck is in bottom goal (opponent scores)
  else if (
    puck.position.y >= TABLE_Y + TABLE_HEIGHT &&
    puck.position.x > goalLeft &&
    puck.position.x < goalRight
  ) {
    console.log("Opponent scores!");
    dispatch({ type: "score", player: "player2" });

    // Player 2 scored, so player 1 (bottom) starts with the puck
    resetPuck(puck, "player", dispatch);

    puckSpeedMultiplier = 1;
    consecutiveHits = 0;
    lastMalletHit = null;
    return entities;
  }

  // Check for wall collisions
  const puckRadius = PUCK_SIZE / 2;
  const currentTime = Date.now();
  const collisionCooldown = 100; // ms between collision events

  // Left wall collision
  if (puck.position.x - puckRadius <= TABLE_X) {
    Matter.Body.setPosition(puck, {
      x: TABLE_X + puckRadius + 1,
      y: puck.position.y,
    });
    Matter.Body.setVelocity(puck, {
      x: -puck.velocity.x * 0.8,
      y: puck.velocity.y * 0.9,
    });

    // Increase puck glow intensity
    puckGlowIntensity = Math.min(MAX_GLOW_INTENSITY, puckGlowIntensity + 8);
    entities.puck.glowIntensity = puckGlowIntensity;

    // Dispatch wall collision event for ripple effect
    if (currentTime - lastWallCollision > collisionCooldown) {
      dispatch({
        type: "wall_collision",
        position: { x: TABLE_X, y: puck.position.y },
      });
      lastWallCollision = currentTime;
    }
  }

  // Right wall collision
  if (puck.position.x + puckRadius >= TABLE_X + TABLE_WIDTH) {
    Matter.Body.setPosition(puck, {
      x: TABLE_X + TABLE_WIDTH - puckRadius - 1,
      y: puck.position.y,
    });
    Matter.Body.setVelocity(puck, {
      x: -puck.velocity.x * 0.8,
      y: puck.velocity.y * 0.9,
    });

    // Increase puck glow intensity
    puckGlowIntensity = Math.min(MAX_GLOW_INTENSITY, puckGlowIntensity + 8);
    entities.puck.glowIntensity = puckGlowIntensity;

    // Dispatch wall collision event for ripple effect
    if (currentTime - lastWallCollision > collisionCooldown) {
      dispatch({
        type: "wall_collision",
        position: { x: TABLE_X + TABLE_WIDTH, y: puck.position.y },
      });
      lastWallCollision = currentTime;
    }
  }

  // Top wall collision (if not in goal)
  if (
    puck.position.y - puckRadius <= TABLE_Y &&
    (puck.position.x <= goalLeft || puck.position.x >= goalRight)
  ) {
    Matter.Body.setPosition(puck, {
      x: puck.position.x,
      y: TABLE_Y + puckRadius + 1,
    });
    Matter.Body.setVelocity(puck, {
      x: puck.velocity.x * 0.9,
      y: -puck.velocity.y * 0.8,
    });

    // Increase puck glow intensity
    puckGlowIntensity = Math.min(MAX_GLOW_INTENSITY, puckGlowIntensity + 8);
    entities.puck.glowIntensity = puckGlowIntensity;

    // Dispatch wall collision event for ripple effect
    if (currentTime - lastWallCollision > collisionCooldown) {
      dispatch({
        type: "wall_collision",
        position: { x: puck.position.x, y: TABLE_Y },
      });
      lastWallCollision = currentTime;
    }
  }

  // Bottom wall collision (if not in goal)
  if (
    puck.position.y + puckRadius >= TABLE_Y + TABLE_HEIGHT &&
    (puck.position.x <= goalLeft || puck.position.x >= goalRight)
  ) {
    Matter.Body.setPosition(puck, {
      x: puck.position.x,
      y: TABLE_Y + TABLE_HEIGHT - puckRadius - 1,
    });
    Matter.Body.setVelocity(puck, {
      x: puck.velocity.x * 0.9,
      y: -puck.velocity.y * 0.8,
    });

    // Increase puck glow intensity
    puckGlowIntensity = Math.min(MAX_GLOW_INTENSITY, puckGlowIntensity + 8);
    entities.puck.glowIntensity = puckGlowIntensity;

    // Dispatch wall collision event for ripple effect
    if (currentTime - lastWallCollision > collisionCooldown) {
      dispatch({
        type: "wall_collision",
        position: { x: puck.position.x, y: TABLE_Y + TABLE_HEIGHT },
      });
      lastWallCollision = currentTime;
    }
  }

  // Check for mallet collisions
  const checkMalletCollision = (mallet) => {
    const dx = puck.position.x - mallet.position.x;
    const dy = puck.position.y - mallet.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = puckRadius + MALLET_SIZE / 2;
    const currentTime = Date.now();
    const hitCooldown = 150; // ms between hits from the same mallet

    if (distance < minDistance) {
      // Allow the same mallet to hit again after a cooldown period
      // This fixes the issue with consecutive hits from the same mallet
      if (
        lastMalletHit !== mallet ||
        currentTime - lastMalletHitTime > hitCooldown
      ) {
        console.log("Mallet hit!");
        dispatch({ type: "mallet_hit" });

        // Increase consecutive hits counter
        consecutiveHits++;
        lastMalletHit = mallet;
        lastMalletHitTime = currentTime;

        // Increase puck speed slightly after each hit
        if (consecutiveHits > 2) {
          puckSpeedMultiplier = Math.min(1.5, 1 + consecutiveHits * 0.05);
        }

        // Increase puck glow intensity
        puckGlowIntensity = MAX_GLOW_INTENSITY;
        entities.puck.glowIntensity = puckGlowIntensity;

        // Calculate collision angle and apply force
        const angle = Math.atan2(dy, dx);

        // Get mallet velocity
        const malletVelocity = {
          x: mallet.velocity ? mallet.velocity.x : 0,
          y: mallet.velocity ? mallet.velocity.y : 0,
        };

        const malletSpeed = Math.sqrt(
          malletVelocity.x * malletVelocity.x +
            malletVelocity.y * malletVelocity.y
        );
        const impactSpeed = Math.max(7, malletSpeed * 2) * puckSpeedMultiplier;

        // Push puck away from mallet
        Matter.Body.setPosition(puck, {
          x: mallet.position.x + Math.cos(angle) * (minDistance + 1),
          y: mallet.position.y + Math.sin(angle) * (minDistance + 1),
        });

        const newVelocity = {
          x: Math.cos(angle) * impactSpeed + malletVelocity.x * 0.3,
          y: Math.sin(angle) * impactSpeed + malletVelocity.y * 0.3,
        };

        Matter.Body.setVelocity(puck, newVelocity);
      }
    }
  };

  checkMalletCollision(playerMallet);
  checkMalletCollision(opponentMallet);

  // Apply friction to slow down the puck
  Matter.Body.setVelocity(puck, {
    x: puck.velocity.x * 0.995,
    y: puck.velocity.y * 0.995,
  });

  // Update physics engine
  Matter.Engine.update(engine, time.delta);

  return entities;
};

// AI mallet movement logic - improved to retrieve puck when it's behind
const getMalletMovement = (difficulty, puck, mallet) => {
  // Base movement speed and parameters
  let speed;
  let reactionDelay;
  let errorMargin;
  let defensivePosition;
  let aggressiveness;
  let retrieveSpeed;

  switch (difficulty) {
    case "easy":
      speed = 6;
      reactionDelay = 8;
      errorMargin = 30;
      defensivePosition = 0.6;
      aggressiveness = 0.3;
      retrieveSpeed = 4;
      break;
    case "medium":
      speed = 10;
      reactionDelay = 4;
      errorMargin = 15;
      defensivePosition = 0.4;
      aggressiveness = 0.6;
      retrieveSpeed = 7;
      break;
    case "hard":
      speed = 14;
      reactionDelay = 1;
      errorMargin = 5;
      defensivePosition = 0.3;
      aggressiveness = 0.9;
      retrieveSpeed = 10;
      break;
    default:
      speed = 10;
      reactionDelay = 4;
      errorMargin = 15;
      defensivePosition = 0.4;
      aggressiveness = 0.6;
      retrieveSpeed = 7;
  }

  // Check if puck is behind the AI mallet (closer to the top wall)
  const isPuckBehindMallet = puck.position.y < mallet.position.y;

  // If puck is behind the mallet, prioritize retrieving it
  if (isPuckBehindMallet) {
    // Calculate direction to puck
    const dx = puck.position.x - mallet.position.x;
    const dy = puck.position.y - mallet.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Move directly toward the puck with appropriate speed
    if (distance > 0) {
      return {
        x: (dx / distance) * retrieveSpeed,
        y: (dy / distance) * retrieveSpeed,
      };
    }
  }

  // Normal AI behavior when puck is not behind
  if (Math.random() < 1 / reactionDelay) {
    // Predict where the puck will be
    const puckVelocity = puck.velocity || { x: 0, y: 0 };
    const isPuckMovingTowardsAI = puckVelocity.y < 0;
    const puckSpeed = Math.sqrt(
      puckVelocity.x * puckVelocity.x + puckVelocity.y * puckVelocity.y
    );

    // Target position calculation
    let targetX, targetY;

    if (isPuckMovingTowardsAI && puckSpeed > 1) {
      // Puck is moving towards AI - intercept it
      // Improved prediction algorithm
      const timeToIntercept = Math.abs(
        (mallet.position.y - puck.position.y) / (puckVelocity.y || 0.1)
      );
      targetX = puck.position.x + puckVelocity.x * timeToIntercept;

      // Add some randomness to make AI imperfect but more realistic
      targetX += (Math.random() * 2 - 1) * errorMargin * (1 - puckSpeed / 20);

      // Keep target within table bounds
      targetX = Math.max(
        TABLE_X + MALLET_SIZE / 2 + 10,
        Math.min(TABLE_X + TABLE_WIDTH - MALLET_SIZE / 2 - 10, targetX)
      );

      // Move forward to intercept
      targetY = Math.min(
        TABLE_Y + TABLE_HEIGHT / 2 - MALLET_SIZE / 2,
        mallet.position.y + speed + puckSpeed * 0.3
      );
    } else {
      // Puck is moving away or slow - return to defensive position
      // Occasionally move to center for more aggressive play
      if (
        Math.random() < aggressiveness &&
        puck.position.y > TABLE_Y + TABLE_HEIGHT * 0.4
      ) {
        // Aggressive positioning - follow puck's x position
        targetX = puck.position.x;
      } else {
        // Default defensive positioning
        targetX = width / 2;
        // Add some randomness to position for more natural movement
        targetX += (Math.random() * 2 - 1) * (errorMargin * 1.5);
      }

      // Defensive position based on difficulty
      targetY = TABLE_Y + TABLE_HEIGHT * defensivePosition;
    }

    // Calculate movement vector
    const dx = targetX - mallet.position.x;
    const dy = targetY - mallet.position.y;

    // Normalize and scale by speed
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      // Adjust speed based on distance for more natural movement
      const adjustedSpeed = Math.min(speed, distance * 0.8);
      return {
        x: (dx / distance) * adjustedSpeed,
        y: (dy / distance) * adjustedSpeed,
      };
    }
  }

  // Small random movement when idle for more lifelike behavior
  if (Math.random() < 0.1) {
    return {
      x: (Math.random() * 2 - 1) * 2,
      y: (Math.random() * 2 - 1) * 2,
    };
  }

  // Default: minimal movement
  return { x: 0, y: 0 };
};

// Updated resetPuck function to place the puck on the side of the player who is starting
const resetPuck = (puck, starter, dispatch) => {
  // Position puck on the side of the player who is starting
  if (starter === "player2") {
    // Player 2 (top) starts with the puck
    Matter.Body.setPosition(puck, {
      x: width / 2,
      y: TABLE_Y + TABLE_HEIGHT * 0.25, // Position in the top quarter of the table
    });
  } else {
    // Player 1 (bottom) starts with the puck
    Matter.Body.setPosition(puck, {
      x: width / 2,
      y: TABLE_Y + TABLE_HEIGHT * 0.75, // Position in the bottom quarter of the table
    });
  }

  // Set velocity to zero - puck stays still
  Matter.Body.setVelocity(puck, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(puck, 0);

  // Dispatch event to show start indicator for the player who is starting
  dispatch({ type: "puck_reset", starter: starter });
};

// Function to position puck exactly at center for game restart
const centerPuck = (puck) => {
  Matter.Body.setPosition(puck, {
    x: width / 2,
    y: height / 2,
  });
  Matter.Body.setVelocity(puck, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(puck, 0);
};

export { Physics, resetPuck, centerPuck };
