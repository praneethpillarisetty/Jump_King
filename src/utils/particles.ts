import { Particle } from '../types';

export function createLandingParticles(x: number, y: number, count: number = 8): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + Math.random() * 32,
      y: y + 32,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: -Math.random() * 3 - 1,
      life: 30,
      maxLife: 30,
      color: '#94a3b8',
      size: Math.random() * 3 + 1
    });
  }
  
  return particles;
}

export function createDeathParticles(x: number, y: number, count: number = 15): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + 16,
      y: y + 16,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: -Math.random() * 4 - 2,
      life: 60,
      maxLife: 60,
      color: Math.random() > 0.5 ? '#ef4444' : '#f59e0b',
      size: Math.random() * 4 + 2
    });
  }
  
  return particles;
}

export function createChargeParticles(x: number, y: number, chargeRatio: number): Particle[] {
  if (Math.random() > 0.3) return [];
  
  const particles: Particle[] = [];
  const count = Math.floor(chargeRatio * 3) + 1;
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + Math.random() * 32,
      y: y + Math.random() * 32,
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: -Math.random() * 2 - 0.5,
      life: 20,
      maxLife: 20,
      color: `hsl(${120 - chargeRatio * 60}, 70%, 60%)`,
      size: Math.random() * 2 + 1
    });
  }
  
  return particles;
}

export function createFallDamageText(x: number, y: number, fallDistance: number): Particle[] {
  const particles: Particle[] = [];
  const blocksText = `${Math.floor(fallDistance / 50)} blocks`;
  
  // Create text effect particles (simplified)
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: x + 16 + (Math.random() - 0.5) * 20,
      y: y - 20 + (Math.random() - 0.5) * 10,
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: -Math.random() * 2 - 1,
      life: 90,
      maxLife: 90,
      color: '#ef4444',
      size: 3
    });
  }
  
  return particles;
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.velocityX,
      y: particle.y + particle.velocityY,
      velocityY: particle.velocityY + 0.1, // Gravity
      life: particle.life - 1
    }))
    .filter(particle => particle.life > 0);
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.fillRect(
      Math.floor(particle.x),
      Math.floor(particle.y),
      Math.ceil(particle.size),
      Math.ceil(particle.size)
    );
  });
  ctx.globalAlpha = 1;
}