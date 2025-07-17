export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  isGrounded: boolean;
  isCharging: boolean;
  chargeTime: number;
  maxChargeTime: number;
  animationState: 'idle' | 'charging' | 'jumping' | 'falling' | 'landing' | 'dying';
  animationFrame: number;
  animationTimer: number;
  isFalling: boolean;
  fallStartY: number;
  fallDistance: number;
  lastGroundedY: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'normal' | 'breakable' | 'moving';
}

export interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  player: Player;
  platforms: Platform[];
  particles: Particle[];
  camera: { x: number; y: number };
  gameStarted: boolean;
  gameTime: number;
  currentHeight: number;
  maxHeight: number;
  levelIndex: number;
}

export interface Controls {
  left: boolean;
  right: boolean;
  charging: boolean;
  spacePressed: boolean;
  spaceJustReleased: boolean;
}

export interface LevelSection {
  platforms: Platform[];
  height: number;
  difficulty: number;
}