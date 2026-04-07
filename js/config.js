const CONFIG = {
  CANVAS: { WIDTH: 390, HEIGHT: 844 },

  GRID: {
    COLS: 7,
    ROWS: 9,
    CELL_SIZE: 48,
    OFFSET_X: 12,
    OFFSET_Y: 310,
    PADDING: 3,
    RADIUS: 10
  },

  COLORS: {
    bgTop: '#F0FFF0',
    bgBottom: '#E8F8F5',
    cellBg: '#FFFFFF',
    cellBorder: '#E8E0D8',
    text: '#5C4033',
    textLight: '#8B7355',
    white: '#FFFFFF',
    accent: '#FFD700',
    star: '#FFD700',
    energyBar: '#7ED6A8',
    energyBg: '#E0E0E0',
    overlay: 'rgba(0,0,0,0.45)',
    heart: '#FF6B8A',

    chainColors: {
      flower: ['#FFE0EB', '#FFB8D0', '#FF9EC0', '#FF7EB0', '#FF5EA0', '#FF3E90', '#FF1E80'],
      dessert: ['#FFF3D0', '#FFE4A0', '#FFD070', '#FFC040', '#FFB020', '#FF9000', '#FF7000'],
      animal: ['#E0F0FF', '#B8D8F0', '#90C8E8', '#68B8E0', '#40A0D8', '#2888D0', '#1070C0']
    }
  },

  CHAINS: {
    flower: {
      name: 'Flower',
      icon: '🌸',
      items: [
        { emoji: '🌰', name: '씨앗' },
        { emoji: '🌱', name: '새싹' },
        { emoji: '🌷', name: '꽃봉오리' },
        { emoji: '🌸', name: '꽃' },
        { emoji: '💐', name: '꽃다발' },
        { emoji: '🌺', name: '화환' },
        { emoji: '🌳', name: '정원' }
      ]
    },
    dessert: {
      name: 'Dessert',
      icon: '🍰',
      items: [
        { emoji: '🍬', name: '사탕' },
        { emoji: '🍪', name: '쿠키' },
        { emoji: '🍩', name: '도넛' },
        { emoji: '🎂', name: '케이크' },
        { emoji: '🧁', name: '컵케이크' },
        { emoji: '🏰', name: '디저트타워' },
        { emoji: '🌈', name: '과자의성' }
      ]
    },
    animal: {
      name: 'Animal',
      icon: '🐾',
      items: [
        { emoji: '🥚', name: '알' },
        { emoji: '🐣', name: '병아리' },
        { emoji: '🐔', name: '닭' },
        { emoji: '🐱', name: '고양이' },
        { emoji: '🐶', name: '강아지' },
        { emoji: '🦄', name: '유니콘' },
        { emoji: '🐉', name: '드래곤' }
      ]
    }
  },

  CHAIN_ORDER: ['flower', 'dessert', 'animal'],

  ENERGY: {
    max: 20,
    rechargeTime: 30000,
    costPerSpawn: 1
  },

  GENERATORS: {
    y: 260,
    radius: 24,
    gap: 90
  },

  ORDERS: {
    maxActive: 2,
    starRewards: [1, 1, 2, 2, 3, 3, 5],
    difficultyTable: [
      { maxLevel: 2, maxCount: 2 },
      { maxLevel: 2, maxCount: 3 },
      { maxLevel: 3, maxCount: 2 },
      { maxLevel: 3, maxCount: 3 },
      { maxLevel: 4, maxCount: 2 },
      { maxLevel: 4, maxCount: 3 },
      { maxLevel: 5, maxCount: 2 },
      { maxLevel: 5, maxCount: 3 },
      { maxLevel: 6, maxCount: 2 },
      { maxLevel: 6, maxCount: 3 }
    ]
  },

  PARTICLES: {
    mergeCount: 10,
    spawnCount: 5,
    deliverCount: 12,
    maxParticles: 150
  },

  ANIM: {
    mergeDuration: 0.25,
    spawnDuration: 0.3,
    moveDuration: 0.15
  }
};
