import { Player, Platform, Particle } from '../types';
import { createLandingParticles, createDeathParticles, createChargeParticles } from './particles';

export const GRAVITY = 0.8;
export const FRICTION = 0.85;
export const MOVE_SPEED = 3;
export const MAX_CHARGE_JUMP = 18;
export const MIN_CHARGE_JUMP = 5;
export const FALL_PUNISHMENT_DISTANCE = 400; // How far to fall as punishment
export const MAX_FALL_BEFORE_RESET = 1200; // Reset if falling too far

export function updatePlayerPhysics(
  player: Player, 
  platforms: Platform[], 
  controls: any,
  onParticlesCreate: (particles: Particle[]) => void
): Player {
  const newPlayer = { ...player };

  // Check for extreme fall (reset to last safe position)
  if (newPlayer.y > newPlayer.lastGroundedY + MAX_FALL_BEFORE_RESET) {
    // Reset to last grounded position
    newPlayer.x = 300;
    newPlayer.y = newPlayer.lastGroundedY;
    newPlayer.velocityX = 0;
    newPlayer.velocityY = 0;
    newPlayer.isGrounded = false;
    newPlayer.isFalling = false;
    newPlayer.fallDistance = 0;
    newPlayer.animationState = 'falling';
    return newPlayer;
  }

  // Update animation
  updateAnimation(newPlayer);

  // Apply gravity
  if (!newPlayer.isGrounded) {
    newPlayer.velocityY += GRAVITY;
  }

  // Handle charging
  if (controls.spacePressed && newPlayer.isGrounded && !newPlayer.isCharging) {
    // Start charging
    newPlayer.isCharging = true;
    newPlayer.chargeTime = 0;
    newPlayer.animationState = 'charging';
  }
  
  if (newPlayer.isCharging && controls.spacePressed && newPlayer.isGrounded) {
    // Continue charging
    newPlayer.chargeTime = Math.min(newPlayer.chargeTime + 1, newPlayer.maxChargeTime);
    
    // Create charge particles
    const chargeRatio = newPlayer.chargeTime / newPlayer.maxChargeTime;
    const chargeParticles = createChargeParticles(newPlayer.x, newPlayer.y, chargeRatio);
    if (chargeParticles.length > 0) {
      onParticlesCreate(chargeParticles);
    }
  }
  
  if (newPlayer.isCharging && controls.spaceJustReleased) {
    // Release jump
    const chargeRatio = newPlayer.chargeTime / newPlayer.maxChargeTime;
    const jumpPower = MIN_CHARGE_JUMP + (MAX_CHARGE_JUMP - MIN_CHARGE_JUMP) * chargeRatio;
    newPlayer.velocityY = -jumpPower;
    newPlayer.isCharging = false;
    newPlayer.chargeTime = 0;
    newPlayer.isGrounded = false;
    newPlayer.animationState = 'jumping';
  }
  
  if (newPlayer.isCharging && !controls.spacePressed) {
    // Space was released while charging
    if (!newPlayer.isCharging) {
      // This shouldn't happen, but handle it gracefully
      newPlayer.isCharging = false;
      newPlayer.chargeTime = 0;
    } else {
      // Release jump
      const chargeRatio = newPlayer.chargeTime / newPlayer.maxChargeTime;
      const jumpPower = MIN_CHARGE_JUMP + (MAX_CHARGE_JUMP - MIN_CHARGE_JUMP) * chargeRatio;
      newPlayer.velocityY = -jumpPower;
      newPlayer.isCharging = false;
      newPlayer.chargeTime = 0;
      newPlayer.isGrounded = false;
      newPlayer.animationState = 'jumping';
    }
  }

  // Handle horizontal movement (only when grounded or charging)
  if (newPlayer.isGrounded || newPlayer.isCharging) {
    if (controls.left) {
      newPlayer.velocityX = -MOVE_SPEED;
    } else if (controls.right) {
      newPlayer.velocityX = MOVE_SPEED;
    } else {
      newPlayer.velocityX *= FRICTION;
    }
  } else {
    // No air control - slight deceleration
    newPlayer.velocityX *= 0.98;
    // Set falling animation if moving down
    if (newPlayer.velocityY > 0 && newPlayer.animationState !== 'falling') {
      newPlayer.animationState = 'falling';
    }
  }

  // Update position
  newPlayer.x += newPlayer.velocityX;
  newPlayer.y += newPlayer.velocityY;

  // Track falling for punishment system
  if (!newPlayer.isGrounded && newPlayer.velocityY > 0 && !newPlayer.isFalling) {
    newPlayer.isFalling = true;
    newPlayer.fallStartY = newPlayer.y;
  }

  // Handle collisions
  const collisionResult = handleCollisions(newPlayer, platforms, onParticlesCreate);
  return collisionResult;
}

function handleCollisions(
  player: Player, 
  platforms: Platform[], 
  onParticlesCreate: (particles: Particle[]) => void
): Player {
  const newPlayer = { ...player };
  const wasGrounded = newPlayer.isGrounded;
  newPlayer.isGrounded = false;

  for (const platform of platforms) {
    // Check if player is colliding with platform
    if (newPlayer.x < platform.x + platform.width &&
        newPlayer.x + newPlayer.width > platform.x &&
        newPlayer.y < platform.y + platform.height &&
        newPlayer.y + newPlayer.height > platform.y) {
      
      // Determine collision direction
      const overlapLeft = (newPlayer.x + newPlayer.width) - platform.x;
      const overlapRight = (platform.x + platform.width) - newPlayer.x;
      const overlapTop = (newPlayer.y + newPlayer.height) - platform.y;
      const overlapBottom = (platform.y + platform.height) - newPlayer.y;

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop && newPlayer.velocityY > 0) {
        // Landing on top of platform
        newPlayer.y = platform.y - newPlayer.height;
        newPlayer.velocityY = 0;
        newPlayer.isGrounded = true;
        
        // Update last grounded position
        newPlayer.lastGroundedY = Math.min(newPlayer.lastGroundedY, newPlayer.y);
        
        // Calculate fall distance for punishment
        if (newPlayer.isFalling) {
          newPlayer.fallDistance = newPlayer.y - newPlayer.fallStartY;
          newPlayer.isFalling = false;
          
          // Check if this was a significant fall that should trigger punishment
          if (newPlayer.fallDistance > FALL_PUNISHMENT_DISTANCE) {
            // Create fall punishment particles
            onParticlesCreate(createDeathParticles(newPlayer.x, newPlayer.y, Math.floor(newPlayer.fallDistance / 50)));
          }
        }
        
        // Landing animation and particles
        if (!wasGrounded) {
          newPlayer.animationState = 'landing';
          onParticlesCreate(createLandingParticles(newPlayer.x, newPlayer.y));
        }
      } else if (minOverlap === overlapBottom && newPlayer.velocityY < 0) {
        // Hitting platform from below
        newPlayer.y = platform.y + platform.height;
        newPlayer.velocityY = 0;
      } else if (minOverlap === overlapLeft && newPlayer.velocityX > 0) {
        // Hitting platform from left
        newPlayer.x = platform.x - newPlayer.width;
        newPlayer.velocityX = 0;
      } else if (minOverlap === overlapRight && newPlayer.velocityX < 0) {
        // Hitting platform from right
        newPlayer.x = platform.x + platform.width;
        newPlayer.velocityX = 0;
      }
    }
  }

  // Set idle animation when grounded and not moving much
  if (newPlayer.isGrounded && !newPlayer.isCharging && Math.abs(newPlayer.velocityX) < 0.5) {
    if (newPlayer.animationState === 'landing' && newPlayer.animationTimer > 20) {
      newPlayer.animationState = 'idle';
    } else if (newPlayer.animationState !== 'landing' && newPlayer.animationState !== 'idle') {
      newPlayer.animationState = 'idle';
    }
  }

  return newPlayer;
}

export function updateAnimation(player: Player) {
  player.animationTimer++;
  
  const frameDuration = getAnimationFrameDuration(player.animationState);
  if (player.animationTimer >= frameDuration) {
    player.animationFrame = (player.animationFrame + 1) % getAnimationFrameCount(player.animationState);
    player.animationTimer = 0;
  }
}

function getAnimationFrameDuration(state: string): number {
  switch (state) {
    case 'idle': return 60;
    case 'charging': return 8;
    case 'jumping': return 20;
    case 'falling': return 15;
    case 'landing': return 10;
    default: return 30;
  }
}

function getAnimationFrameCount(state: string): number {
  switch (state) {
    case 'idle': return 1;
    case 'charging': return 1;
    case 'jumping': return 1;
    case 'falling': return 1;
    case 'landing': return 1;
    default: return 1;
  }
}

export function getFallSeverity(fallDistance: number): number {
  if (fallDistance > 500) {
    return 3; // Big fall sound
  } else if (fallDistance > 300) {
    return 2; // Medium fall sound
  } else if (fallDistance > 150) {
    return 1; // Small fall sound
  }
  return 0;
}