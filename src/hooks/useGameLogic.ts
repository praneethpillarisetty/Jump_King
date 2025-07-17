import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Controls, Player, Platform, Particle } from '../types';
import { updatePlayerPhysics, checkFallDamage } from '../utils/physics';
import { generateLevel, getNextLevelHeight, generateProceduralSection } from '../utils/levelGenerator';
import { soundManager } from '../utils/soundManager';
import { updateParticles } from '../utils/particles';

const INITIAL_PLAYER: Player = {
  x: 300,
  y: 400,
  width: 32,
  height: 32,
  velocityX: 0,
  velocityY: 0,
  isGrounded: false,
  isCharging: false,
  chargeTime: 0,
  maxChargeTime: 60, // 1 second at 60fps
  animationState: 'falling',
  animationFrame: 0,
  animationTimer: 0,
  isFalling: false,
  fallStartY: 400,
  fallDistance: 0,
  lastGroundedY: 400,
};

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>({
    player: { ...INITIAL_PLAYER },
    platforms: generateLevel(500, 0),
    particles: [],
    camera: { x: 0, y: 0 },
    gameStarted: false,
    gameTime: 0,
    currentHeight: 0,
    maxHeight: 0,
    levelIndex: 0,
  });

  const [controls, setControls] = useState<Controls>({
    left: false,
    right: false,
    charging: false, // Keep for mobile controls
    spacePressed: false,
    spaceJustReleased: false,
  });

  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Initialize sound manager
  useEffect(() => {
    soundManager.initializeSounds();
  }, []);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setGameState(prevState => {
      if (!prevState.gameStarted && (controls.left || controls.right || controls.charging)) {
        // Start the game
        return { ...prevState, gameStarted: true };
      }

      if (!prevState.gameStarted) {
        return prevState;
      }

      const newState = { ...prevState };

      // Update game time
      newState.gameTime += deltaTime / 1000;

      // Store previous grounded state for sound effects
      const wasGrounded = prevState.player.isGrounded;
      const wasCharging = prevState.player.isCharging;

      // Update player physics
      newState.player = updatePlayerPhysics(
        newState.player, 
        newState.platforms, 
        controls,
        (particles: Particle[]) => {
          newState.particles = [...newState.particles, ...particles];
        }
      );

      // Check for landing sound
      if (!wasGrounded && newState.player.isGrounded) {
        soundManager.playSound('land');
        
        // Check for fall damage sound based on fall distance
        if (newState.player.fallDistance > 0) {
          const fallSeverity = getFallSeverity(newState.player.fallDistance);
          soundManager.playFallSound(fallSeverity);
        }
      }

      // Check for jump sound
      if (wasCharging && !newState.player.isCharging && newState.player.velocityY < 0) {
        soundManager.playSound('jump');
      }

      // Check for charge sound
      if (!wasCharging && newState.player.isCharging) {
        soundManager.playSound('charge');
      }

      // Update particles
      newState.particles = updateParticles(newState.particles);

      // Update camera to follow player
      const targetCameraY = newState.player.y - CANVAS_HEIGHT * 0.7;
      newState.camera.y += (targetCameraY - newState.camera.y) * 0.1;

      // Update height
      const currentHeight = Math.max(0, 500 - newState.player.y);
      newState.currentHeight = currentHeight;
      newState.maxHeight = Math.max(newState.maxHeight, currentHeight);

      // Generate new level sections as player climbs higher
      if (newState.player.y < -newState.levelIndex * 800) {
        newState.levelIndex++;
        
        let newPlatforms: Platform[];
        if (newState.levelIndex < 8) {
          // Use predefined patterns for first 8 sections
          newPlatforms = generateLevel(-newState.levelIndex * 800, newState.levelIndex % 4);
        } else {
          // Use procedural generation for infinite gameplay
          const difficulty = Math.min(10, Math.floor(newState.levelIndex / 4));
          newPlatforms = generateProceduralSection(-newState.levelIndex * 800, difficulty);
        }
        
        // Remove old platforms that are too far below
        const filteredPlatforms = newState.platforms.filter(
          platform => platform.y > newState.player.y + CANVAS_HEIGHT * 2
        );
        
        newState.platforms = [...filteredPlatforms, ...newPlatforms];
      }

      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [controls]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  const updateControls = useCallback((newControls: Partial<Controls>) => {
    setControls(prev => ({ ...prev, ...newControls }));
  }, []);

  const restart = useCallback(() => {
    setGameState({
      player: { ...INITIAL_PLAYER },
      platforms: generateLevel(500, 0),
      particles: [],
      camera: { x: 0, y: 0 },
      gameStarted: false,
      gameTime: 0,
      currentHeight: 0,
      maxHeight: 0,
      levelIndex: 0,
    });
    setControls({
      left: false,
      right: false,
      charging: false,
      spacePressed: false,
      spaceJustReleased: false,
    });
  }, []);

  return {
    gameState,
    controls,
    updateControls,
    restart,
  };
}