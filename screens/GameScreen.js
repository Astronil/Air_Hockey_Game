import { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import { Physics, centerPuck } from "../physics";
import RippleEffect from "../components/RippleEffect";
import Celebration from "../components/Celebration";
import NeonBorder from "../components/NeonBorder";
import StartIndicator from "../components/StartIndicator";
import Entities from "../entities";
import Matter from "matter-js";

const { width, height } = Dimensions.get("window");

// Table dimensions for positioning
const TABLE_WIDTH = width * 0.9;
const TABLE_HEIGHT = height * 0.8;
const TABLE_X = (width - TABLE_WIDTH) / 2;
const TABLE_Y = (height - TABLE_HEIGHT) / 2;

const GameScreen = ({
  gameEngine,
  setGameEngine,
  currentEntities,
  setCurrentEntities,
  score,
  setScore,
  gameState,
  setGameState,
  playSound,
  isMultiplayer,
  GAME_STATES,
}) => {
  const [wallCollision, setWallCollision] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showStartIndicator, setShowStartIndicator] = useState(false);
  const [startingPlayer, setStartingPlayer] = useState(null);
  const [lastScorer, setLastScorer] = useState(null);

  // Update the onEvent function to handle the starter information
  const onEvent = (e) => {
    console.log("Game event:", e.type);

    if (e.type === "score") {
      console.log(`Score for ${e.player}`);

      // Play point sound
      playSound("point");

      // Show celebration
      setLastScorer(e.player);
      setShowCelebration(true);

      setScore((prevScore) => {
        const newScore = {
          player:
            e.player === "player" ? prevScore.player + 1 : prevScore.player,
          player2:
            e.player === "player2" ? prevScore.player2 + 1 : prevScore.player2,
        };

        console.log("New score:", newScore);

        // Check for game over (first to 7 points)
        if (newScore.player >= 7 || newScore.player2 >= 7) {
          console.log("Game over!");

          // Stop the game engine
          if (gameEngine.current) {
            gameEngine.current.stop();
          }

          // Wait for celebration to complete before showing game over screen
          setTimeout(() => {
            playSound("gameOver");
            setGameState(GAME_STATES.GAME_OVER);
          }, 2000);
        }

        return newScore;
      });
    } else if (e.type === "mallet_hit") {
      // Play hit sound
      playSound("hit");
    } else if (e.type === "wall_collision") {
      // Show ripple effect at collision point
      setWallCollision({
        x: e.position.x,
        y: e.position.y,
      });

      // Play wall hit sound
      playSound("hit");
    } else if (e.type === "puck_reset") {
      // Show start indicator only for the player who is starting
      setStartingPlayer(e.starter);
      setShowStartIndicator(true);
    }
  };

  // Update the handleCelebrationComplete function to show start indicator for the correct player
  const handleCelebrationComplete = () => {
    setShowCelebration(false);

    // Show start indicator for the player who is starting (opposite to who scored)
    // If player 1 scored, player 2 starts
    // If player 2 scored, player 1 starts
    const starter = lastScorer === "player" ? "player2" : "player";
    setStartingPlayer(starter);
    setShowStartIndicator(true);
  };

  // Fix the restartGame function to properly reset everything
  const restartGame = () => {
    console.log("Restarting game completely...");

    // Stop the game engine first
    if (gameEngine) {
      gameEngine.stop();
    }

    // Create completely fresh entities with the current game mode
    const mode = isMultiplayer ? "multiplayer" : "medium";

    // Force a complete recreation of the game engine and entities
    setGameState(GAME_STATES.WELCOME);

    // Reset all game state variables
    setScore({ player: 0, player2: 0 });
    setWallCollision(null);
    setShowCelebration(false);
    setShowStartIndicator(false);
    setStartingPlayer(null);
    setLastScorer(null);

    // Create new entities after a short delay to ensure clean state
    setTimeout(() => {
      const entities = Entities(mode);
      setCurrentEntities(entities);

      // Start the game after entities are set
      setTimeout(() => {
        setGameState(GAME_STATES.PLAYING);
        if (gameEngine) {
          gameEngine.start();
        }
      }, 100);
    }, 100);
  };

  const renderScoreboard = () => (
    <View style={styles.scoreboardContainer}>
      <NeonBorder color="#00ffff" />
      <Text style={styles.scoreText}>
        <Text style={styles.playerText}>{score.player}</Text>
        <Text style={styles.vsText}> - </Text>
        <Text style={styles.botText}>{score.player2}</Text>
      </Text>
    </View>
  );

  if (!currentEntities) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game Engine */}
      <GameEngine
        ref={(ref) => {
          setGameEngine(ref);
        }}
        style={styles.gameContainer}
        systems={[Physics]}
        entities={currentEntities}
        onEvent={onEvent}
        running={gameState === GAME_STATES.PLAYING}
      />

      {/* Ripple Effects */}
      {wallCollision && (
        <RippleEffect
          position={wallCollision}
          onComplete={() => setWallCollision(null)}
        />
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <Celebration
          player={lastScorer}
          onComplete={handleCelebrationComplete}
          playSound={playSound}
        />
      )}

      {/* Start Indicator - only show for the player who is starting */}
      {showStartIndicator && (
        <StartIndicator
          player={startingPlayer}
          onComplete={() => setShowStartIndicator(false)}
        />
      )}

      {/* Scoreboard */}
      {renderScoreboard()}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setGameState(GAME_STATES.WELCOME);
        }}
      >
        <NeonBorder color="#ffffff" width={1} />
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Restart Button */}
      <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
        <NeonBorder color="#ffffff" width={1} />
        <Text style={styles.restartButtonText}>↻</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  gameContainer: {
    flex: 1,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#fff",
  },
  scoreboardContainer: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "rgba(44, 62, 80, 0.8)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    zIndex: 10,
  },
  scoreText: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  playerText: {
    color: "#e74c3c", // Red for player 1
  },
  botText: {
    color: "#3498db", // Blue for player 2 or AI
  },
  vsText: {
    color: "#FFF",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  restartButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  restartButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default GameScreen;
