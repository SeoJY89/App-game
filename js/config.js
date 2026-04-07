const CONFIG = {
  CANVAS: {
    WIDTH: 390,
    HEIGHT: 844
  },

  COLORS: {
    background: '#F0E6FF',
    backgroundTop: '#F8F2FF',
    text: '#5C4033',
    textLight: '#8B7355',
    accent: '#FFD700',
    heart: '#FF6B8A',
    heartEmpty: '#D4C5B9',
    white: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',

    mochi: [
      '#FFB8D0', // sakura pink
      '#B8E6C8', // matcha green
      '#FFE4A0', // custard yellow
      '#A8D8F0', // sky blue
      '#D4B8FF', // taro purple
      '#FFD1A9', // peach orange
    ],

    golden: '#FFD700',
    goldenGlow: '#FFF4CC'
  },

  MOCHI: {
    minRadius: 28,
    maxRadius: 42,
    minSpeed: 55,
    maxSpeed: 85,
    wobbleAmplitude: 3,
    wobbleSpeed: 2.5,
    hitRadiusMultiplier: 1.15,
    goldenChance: 0.05,
    normalScore: 10,
    goldenScore: 50
  },

  GAME: {
    initialLives: 3,
    comboTimeout: 800,
    maxCombo: 10,
    feverDuration: 3000,
    feverScoreMultiplier: 2,
    feverThresholds: [500, 1500, 3000, 5000, 8000]
  },

  DIFFICULTY: {
    initialSpawnInterval: 1000,
    spawnIntervalDecrease: 12,
    minSpawnInterval: 220,
    speedIncreasePerSecond: 1.8,
    maxSpeedMultiplier: 3.0
  },

  PARTICLES: {
    popCount: 8,
    popSpeed: 120,
    popLife: 0.6,
    sparkleInterval: 300,
    maxParticles: 200
  }
};
