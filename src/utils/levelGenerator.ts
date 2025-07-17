import { Platform, LevelSection } from '../types';

const LEVEL_PATTERNS: LevelSection[] = [
  // Pattern 1: Basic staircase
  {
    height: 800,
    difficulty: 1,
    platforms: [
      { x: 100, y: 700, width: 200, height: 20 },
      { x: 400, y: 600, width: 150, height: 20 },
      { x: 50, y: 500, width: 180, height: 20 },
      { x: 350, y: 400, width: 200, height: 20 },
      { x: 150, y: 300, width: 120, height: 20 },
      { x: 400, y: 200, width: 160, height: 20 },
      { x: 100, y: 100, width: 250, height: 20 },
    ]
  },
  // Pattern 2: Narrow platforms
  {
    height: 900,
    difficulty: 2,
    platforms: [
      { x: 200, y: 800, width: 100, height: 20 },
      { x: 400, y: 700, width: 80, height: 20 },
      { x: 100, y: 600, width: 90, height: 20 },
      { x: 350, y: 500, width: 70, height: 20 },
      { x: 150, y: 400, width: 100, height: 20 },
      { x: 400, y: 300, width: 80, height: 20 },
      { x: 50, y: 200, width: 120, height: 20 },
      { x: 300, y: 100, width: 100, height: 20 },
    ]
  },
  // Pattern 3: Wide gaps
  {
    height: 1000,
    difficulty: 3,
    platforms: [
      { x: 50, y: 900, width: 150, height: 20 },
      { x: 350, y: 750, width: 200, height: 20 },
      { x: 100, y: 600, width: 100, height: 20 },
      { x: 400, y: 450, width: 150, height: 20 },
      { x: 50, y: 300, width: 180, height: 20 },
      { x: 350, y: 150, width: 200, height: 20 },
    ]
  },
  // Pattern 4: Precise jumps
  {
    height: 850,
    difficulty: 4,
    platforms: [
      { x: 250, y: 750, width: 60, height: 20 },
      { x: 150, y: 650, width: 80, height: 20 },
      { x: 400, y: 550, width: 60, height: 20 },
      { x: 100, y: 450, width: 70, height: 20 },
      { x: 350, y: 350, width: 90, height: 20 },
      { x: 200, y: 250, width: 60, height: 20 },
      { x: 50, y: 150, width: 100, height: 20 },
      { x: 400, y: 50, width: 150, height: 20 },
    ]
  }
];

export function generateLevel(startY: number, patternIndex: number): Platform[] {
  const pattern = LEVEL_PATTERNS[patternIndex % LEVEL_PATTERNS.length];
  
  // Add some randomization to make it feel more dynamic
  const platforms = pattern.platforms.map(platform => ({
    ...platform,
    y: startY - platform.y,
    x: platform.x + (Math.random() - 0.5) * 20, // Small random offset
    width: platform.width + (Math.random() - 0.5) * 10, // Small width variation
  }));

  // Add ground platform at the bottom
  platforms.push({
    x: 0,
    y: startY + 50,
    width: 600,
    height: 50
  });

  return platforms;
}

export function getNextLevelHeight(patternIndex: number): number {
  const pattern = LEVEL_PATTERNS[patternIndex % LEVEL_PATTERNS.length];
  return pattern.height;
}

// Procedural generation for infinite gameplay
export function generateProceduralSection(startY: number, difficulty: number): Platform[] {
  const platforms: Platform[] = [];
  const sectionHeight = 800 + Math.random() * 400;
  const platformCount = 6 + Math.floor(Math.random() * 4);
  
  for (let i = 0; i < platformCount; i++) {
    const y = startY - (i + 1) * (sectionHeight / platformCount);
    const x = 50 + Math.random() * 400;
    const width = Math.max(60, 150 - difficulty * 10 + Math.random() * 50);
    
    platforms.push({
      x,
      y,
      width,
      height: 20
    });
  }

  // Add ground platform
  platforms.push({
    x: 0,
    y: startY + 50,
    width: 600,
    height: 50
  });

  return platforms;
}