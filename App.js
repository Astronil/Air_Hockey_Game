import { useState, useEffect } from "react";
import { StyleSheet, View, StatusBar, LogBox } from "react-native";
import { Audio } from "expo-av";
import Entities from "./entities";
import { GAME_STATES } from "./utils";

// Import screens
import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import GameScreen from "./screens/GameScreen";
import GameOverScreen from "./screens/GameOverScreen";

// Ignore specific warnings related to image loading
LogBox.ignoreLogs([
  "Warning: Failed prop type",
  "source.uri should not be an empty string",
  "Invalid props.style key",
]);

export default function App() {
  const [gameEngine, setGameEngine] = useState(null);
  const [gameState, setGameState] = useState(GAME_STATES.SPLASH);
  const [currentEntities, setCurrentEntities] = useState(null);
  const [score, setScore] = useState({ player: 0, player2: 0 });
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState(null);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [sounds, setSounds] = useState({
    hit: null,
    crowd: null,
    point: null,
    gameOver: null,
  });

  // Load sounds
  useEffect(() => {
    async function loadSounds() {
      try {
        console.log("Loading sounds...");

        const hitSound = new Audio.Sound();
        await hitSound.loadAsync(require("./assets/hit.mp3"));

        const crowdSound = new Audio.Sound();
        await crowdSound.loadAsync(require("./assets/crowd.mp3"));

        const pointSound = new Audio.Sound();
        await pointSound.loadAsync(require("./assets/point.mp3"));

        const gameOverSound = new Audio.Sound();
        await gameOverSound.loadAsync(require("./assets/game-over.mp3"));

        setSounds({
          hit: hitSound,
          crowd: crowdSound,
          point: pointSound,
          gameOver: gameOverSound,
        });

        console.log("Sounds loaded successfully");
      } catch (error) {
        console.log("Error loading sounds:", error);
        // Continue without sounds if there's an error
      }
    }

    loadSounds();
  }, []);

  // Add a separate useEffect for cleanup to avoid dependency issues
  useEffect(() => {
    return () => {
      Object.values(sounds).forEach(async (sound) => {
        if (sound) {
          try {
            await sound.unloadAsync();
          } catch (error) {
            console.log("Error unloading sound:", error);
          }
        }
      });
    };
  }, [sounds]);

  // Simulate loading assets
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoading((prev) => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setTimeout(() => setGameState(GAME_STATES.WELCOME), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => {
      clearInterval(loadingInterval);
    };
  }, []);

  // Play sound function
  const playSound = async (soundName) => {
    try {
      if (sounds[soundName]) {
        await sounds[soundName].replayAsync();
      }
    } catch (error) {
      console.log(`Error playing ${soundName} sound:`, error);
    }
  };

  const startGame = (mode) => {
    try {
      console.log("Starting game in mode:", mode);
      setScore({ player: 0, player2: 0 });
      setGameState(GAME_STATES.PLAYING);
      const gameMode = mode === "single" ? difficulty : "multiplayer";
      setIsMultiplayer(mode === "multiplayer");
      const entities = Entities(gameMode);
      console.log("Created entities:", Object.keys(entities));
      setCurrentEntities(entities);
      setError(null);

      // Removed crowd sound at game start
    } catch (err) {
      console.error("Error starting game:", err);
      setError(`Error starting game: ${err.message}`);
    }
  };

  const restartGame = () => {
    try {
      console.log("Restarting game");
      // Create fresh entities
      const mode = isMultiplayer ? "multiplayer" : difficulty;
      const entities = Entities(mode);
      console.log("Created entities for restart:", Object.keys(entities));
      setCurrentEntities(entities);
      setScore({ player: 0, player2: 0 });
      setGameState(GAME_STATES.PLAYING);
      setError(null);

      // Removed crowd sound at game restart
    } catch (err) {
      console.error("Error restarting game:", err);
      setError(`Error restarting game: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {gameState === GAME_STATES.SPLASH && <SplashScreen loading={loading} />}

      {gameState === GAME_STATES.WELCOME && (
        <WelcomeScreen
          setDifficulty={setDifficulty}
          difficulty={difficulty}
          startGame={startGame}
          error={error}
          playSound={playSound}
        />
      )}

      {gameState === GAME_STATES.PLAYING && (
        <GameScreen
          gameEngine={gameEngine}
          setGameEngine={setGameEngine}
          currentEntities={currentEntities}
          setCurrentEntities={setCurrentEntities} // Add this prop
          score={score}
          setScore={setScore}
          gameState={gameState}
          setGameState={setGameState}
          playSound={playSound}
          isMultiplayer={isMultiplayer}
          GAME_STATES={GAME_STATES}
        />
      )}

      {gameState === GAME_STATES.GAME_OVER && (
        <GameOverScreen
          score={score}
          isMultiplayer={isMultiplayer}
          restartGame={restartGame}
          setGameState={setGameState}
          GAME_STATES={GAME_STATES}
          playSound={playSound}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
