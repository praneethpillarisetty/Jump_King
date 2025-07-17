import React, { useRef, useEffect, useCallback } from 'react';
import { Player, Platform, GameState, Controls, Particle } from '../types';
import { renderSprite, knightSprites, knightColors } from '../utils/characterSprites';
import { renderParticles } from '../utils/particles';

interface GameCanvasProps {
  gameState: GameState;
  controls: Controls;
  onPlayerUpdate: (player: Player) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  controls,
  onPlayerUpdate,
  canvasWidth,
  canvasHeight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#1e293b'; // Dark slate background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw parallax background
    drawParallaxBackground(ctx, gameState.camera, canvasWidth, canvasHeight);

    // Save context for camera transform
    ctx.save();
    
    // Apply camera transform
    ctx.translate(-gameState.camera.x, -gameState.camera.y);

    // Draw platforms
    gameState.platforms.forEach(platform => {
      // Only draw platforms that are visible
      if (platform.y > gameState.camera.y - 100 && 
          platform.y < gameState.camera.y + canvasHeight + 100) {
        
        // Platform with pixel art style
        ctx.fillStyle = '#475569';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform highlights
        ctx.fillStyle = '#64748b';
        ctx.fillRect(platform.x, platform.y, platform.width, 2);
        
        // Platform border
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
      }
    });

    // Draw particles
    renderParticles(ctx, gameState.particles);

    // Draw player
    const player = gameState.player;
    
    // Draw character sprite
    drawCharacter(ctx, player);

    // Draw fall distance indicator
    if (player.isFalling && player.fallDistance > 100) {
      const fallBlocks = Math.floor(player.fallDistance / 50);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`-${fallBlocks} blocks`, player.x + player.width / 2, player.y - 40);
      ctx.textAlign = 'left';
    }

    // Draw charge meter when charging
    if (player.isCharging) {
      const meterWidth = 100;
      const meterHeight = 10;
      const meterX = player.x + player.width / 2 - meterWidth / 2;
      const meterY = player.y - 30;
      
      // Meter background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
      
      // Meter fill
      const chargeRatio = player.chargeTime / player.maxChargeTime;
      ctx.fillStyle = `hsl(${120 - chargeRatio * 60}, 70%, 50%)`;
      ctx.fillRect(meterX, meterY, meterWidth * chargeRatio, meterHeight);
      
      // Meter border
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2;
      ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
    }

    // Restore context
    ctx.restore();

    // Draw height markers on the side
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px monospace';
    for (let i = 0; i < 10; i++) {
      const height = Math.floor((gameState.camera.y + canvasHeight - i * canvasHeight / 10) / 100) * 100;
      if (height > 0) {
        ctx.fillText(`${height}m`, 10, i * canvasHeight / 10 + 15);
      }
    }

  }, [gameState, canvasWidth, canvasHeight]);

  const drawParallaxBackground = (
    ctx: CanvasRenderingContext2D,
    camera: { x: number; y: number },
    width: number,
    height: number
  ) => {
    // Distant mountains/towers
    ctx.fillStyle = '#334155';
    for (let i = 0; i < 5; i++) {
      const x = (i * 150 - camera.x * 0.1) % (width + 150);
      const mountainHeight = 200 + Math.sin(i) * 50;
      ctx.fillRect(x, height - mountainHeight + camera.y * 0.1, 100, mountainHeight);
    }
    
    // Closer structures
    ctx.fillStyle = '#475569';
    for (let i = 0; i < 3; i++) {
      const x = (i * 250 - camera.x * 0.3) % (width + 250);
      const structureHeight = 150 + Math.cos(i) * 30;
      ctx.fillRect(x, height - structureHeight + camera.y * 0.3, 80, structureHeight);
    }
  };

  const drawCharacter = (ctx: CanvasRenderingContext2D, player: Player) => {
    // Get current sprite based on animation state
    const sprite = knightSprites[player.animationState as keyof typeof knightSprites] || knightSprites.idle;
    
    // Add charging glow effect
    if (player.isCharging) {
      const chargeRatio = player.chargeTime / player.maxChargeTime;
      const glowSize = 2 + chargeRatio * 4;
      
      ctx.shadowColor = `hsl(${120 - chargeRatio * 60}, 70%, 50%)`;
      ctx.shadowBlur = glowSize;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Render the sprite (scaled up 2x for pixel art look)
    renderSprite(ctx, sprite, player.x, player.y, 2, knightColors);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [draw]);

  useEffect(() => {
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="border-2 border-gray-600 bg-slate-900"
      style={{ 
        imageRendering: 'pixelated',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};