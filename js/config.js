const CONFIG = {
  CANVAS: { WIDTH: 390, HEIGHT: 844 },

  COLORS: {
    bgTop: '#1a1a2e',
    bgBottom: '#16213e',
    surface: '#0f3460',
    surfaceLight: '#1a4a7a',
    cell: 'rgba(255,255,255,0.08)',
    cellActive: 'rgba(255,255,255,0.18)',
    cellCorrect: 'rgba(80,220,150,0.25)',
    text: '#e8e8e8',
    textDim: '#8899aa',
    textHint: '#7ee8b0',
    accent: '#e94560',
    accentGlow: 'rgba(233,69,96,0.3)',
    gold: '#FFD700',
    correct: '#50dc96',
    wrong: '#e94560',
    white: '#FFFFFF',
    keypad: '#1a3a5c',
    keypadPress: '#2a5a8c',
    overlay: 'rgba(0,0,0,0.6)'
  },

  LAYOUT: {
    headerH: 55,
    sceneTop: 70,
    sceneBottom: 440,
    hintPanelTop: 448,
    hintPanelBottom: 560,
    questionY: 575,
    answerY: 610,
    keypadTop: 640,
    keypadCellW: 80,
    keypadCellH: 44,
    keypadGap: 8,
    objectSize: 52,
    zoneSize: 60
  },

  STAGES: [
    {
      id: 1,
      title: '기호의 비밀',
      desc: '기호를 올바른 자리에 놓아 숫자를 밝혀내세요',
      objects: [
        { id: 'star', emoji: '⭐', startX: 0.2, startY: 0.85 },
        { id: 'moon', emoji: '🌙', startX: 0.5, startY: 0.85 },
        { id: 'sun', emoji: '☀️', startX: 0.8, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.2, y: 0.35, label: '①' },
        { id: 'z2', x: 0.5, y: 0.35, label: '②' },
        { id: 'z3', x: 0.8, y: 0.35, label: '③' }
      ],
      matches: [
        { objectId: 'star', zoneId: 'z1', hint: '⭐ = 3' },
        { objectId: 'moon', zoneId: 'z2', hint: '🌙 = 5' },
        { objectId: 'sun', zoneId: 'z3', hint: '☀️ = 2' }
      ],
      question: '⭐ + ☀️ = ?',
      answer: '5'
    },
    {
      id: 2,
      title: '과일 저울',
      desc: '과일의 무게를 알아내세요',
      objects: [
        { id: 'apple', emoji: '🍎', startX: 0.2, startY: 0.85 },
        { id: 'orange', emoji: '🍊', startX: 0.5, startY: 0.85 },
        { id: 'grape', emoji: '🍇', startX: 0.8, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.2, y: 0.3, label: '⚖️' },
        { id: 'z2', x: 0.5, y: 0.3, label: '⚖️' },
        { id: 'z3', x: 0.8, y: 0.3, label: '⚖️' }
      ],
      matches: [
        { objectId: 'apple', zoneId: 'z1', hint: '🍎 = 4' },
        { objectId: 'orange', zoneId: 'z2', hint: '🍊 = 6' },
        { objectId: 'grape', zoneId: 'z3', hint: '🍇 = 🍎 + 🍊' }
      ],
      question: '🍇 = ?',
      answer: '10'
    },
    {
      id: 3,
      title: '거울의 방',
      desc: '거울에 비친 숫자를 해독하세요',
      objects: [
        { id: 'mirror', emoji: '🪞', startX: 0.2, startY: 0.85 },
        { id: 'note', emoji: '📝', startX: 0.5, startY: 0.85 },
        { id: 'key', emoji: '🔑', startX: 0.8, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.25, y: 0.3, label: '벽' },
        { id: 'z2', x: 0.5, y: 0.55, label: '책상' },
        { id: 'z3', x: 0.75, y: 0.3, label: '자물쇠' }
      ],
      matches: [
        { objectId: 'mirror', zoneId: 'z1', hint: '거울 → 숫자를 뒤집어라' },
        { objectId: 'note', zoneId: 'z2', hint: '쪽지: 원래 수는 86' },
        { objectId: 'key', zoneId: 'z3', hint: '열쇠: 뒤집은 수를 입력!' }
      ],
      question: '86을 뒤집으면?',
      answer: '68'
    },
    {
      id: 4,
      title: '시계의 방',
      desc: '시간을 계산하세요',
      objects: [
        { id: 'clock', emoji: '⏰', startX: 0.15, startY: 0.85 },
        { id: 'bell', emoji: '🔔', startX: 0.4, startY: 0.85 },
        { id: 'hour', emoji: '⏳', startX: 0.65, startY: 0.85 },
        { id: 'cal', emoji: '📅', startX: 0.9, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.2, y: 0.25, label: '시작' },
        { id: 'z2', x: 0.5, y: 0.25, label: '경과' },
        { id: 'z3', x: 0.8, y: 0.25, label: '반복' },
        { id: 'z4', x: 0.5, y: 0.55, label: '결과' }
      ],
      matches: [
        { objectId: 'clock', zoneId: 'z1', hint: '시작 시각: 3시' },
        { objectId: 'hour', zoneId: 'z2', hint: '매번 +4시간' },
        { objectId: 'cal', zoneId: 'z3', hint: '3번 반복' },
        { objectId: 'bell', zoneId: 'z4', hint: '3 + 4×3 = ?' }
      ],
      question: '최종 시각은 몇 시?',
      answer: '15'
    },
    {
      id: 5,
      title: '색 혼합 실험',
      desc: '색의 값을 추리하세요',
      objects: [
        { id: 'red', emoji: '🔴', startX: 0.15, startY: 0.85 },
        { id: 'blue', emoji: '🔵', startX: 0.4, startY: 0.85 },
        { id: 'yellow', emoji: '🟡', startX: 0.65, startY: 0.85 },
        { id: 'green', emoji: '🟢', startX: 0.9, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.2, y: 0.25, label: '🧪' },
        { id: 'z2', x: 0.5, y: 0.25, label: '🧪' },
        { id: 'z3', x: 0.8, y: 0.25, label: '🧪' },
        { id: 'z4', x: 0.5, y: 0.55, label: '🧫' }
      ],
      matches: [
        { objectId: 'red', zoneId: 'z1', hint: '🔴 = 3' },
        { objectId: 'blue', zoneId: 'z2', hint: '🔵 = 5' },
        { objectId: 'yellow', zoneId: 'z3', hint: '🟡 = 🔴 + 🔵' },
        { objectId: 'green', zoneId: 'z4', hint: '🟢 = 🟡 - 🔴' }
      ],
      question: '🟢 = ?',
      answer: '5'
    },
    {
      id: 6,
      title: '동물 농장',
      desc: '동물들의 숫자를 추리하세요',
      objects: [
        { id: 'chicken', emoji: '🐔', startX: 0.15, startY: 0.85 },
        { id: 'cow', emoji: '🐄', startX: 0.4, startY: 0.85 },
        { id: 'pig', emoji: '🐷', startX: 0.65, startY: 0.85 },
        { id: 'sheep', emoji: '🐑', startX: 0.9, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.2, y: 0.25, label: '🏠' },
        { id: 'z2', x: 0.5, y: 0.25, label: '🏠' },
        { id: 'z3', x: 0.8, y: 0.25, label: '🏠' },
        { id: 'z4', x: 0.5, y: 0.55, label: '🏠' }
      ],
      matches: [
        { objectId: 'chicken', zoneId: 'z1', hint: '🐔 + 🐔 = 6' },
        { objectId: 'cow', zoneId: 'z2', hint: '🐄 = 🐔 × 2' },
        { objectId: 'pig', zoneId: 'z3', hint: '🐷 = 🐄 - 1' },
        { objectId: 'sheep', zoneId: 'z4', hint: '🐑 = 🐔 + 🐷' }
      ],
      question: '🐑 = ?',
      answer: '8'
    },
    {
      id: 7,
      title: '암호 해독',
      desc: '알파벳 암호를 풀어보세요',
      objects: [
        { id: 'gem', emoji: '💎', startX: 0.15, startY: 0.85 },
        { id: 'orb', emoji: '🔮', startX: 0.4, startY: 0.85 },
        { id: 'crown', emoji: '👑', startX: 0.65, startY: 0.85 },
        { id: 'mask', emoji: '🎭', startX: 0.9, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.2, y: 0.25, label: '📖' },
        { id: 'z2', x: 0.5, y: 0.25, label: '📖' },
        { id: 'z3', x: 0.8, y: 0.25, label: '📖' },
        { id: 'z4', x: 0.5, y: 0.55, label: '📖' }
      ],
      matches: [
        { objectId: 'gem', zoneId: 'z1', hint: '규칙: A=1, B=2, C=3...' },
        { objectId: 'crown', zoneId: 'z3', hint: '암호문: "FACE"' },
        { objectId: 'orb', zoneId: 'z2', hint: 'F=6, A=1, C=3, E=5' },
        { objectId: 'mask', zoneId: 'z4', hint: '답 = 모든 글자의 합' }
      ],
      question: 'F + A + C + E = ?',
      answer: '15'
    },
    {
      id: 8,
      title: '마법진',
      desc: '빈칸의 숫자를 찾으세요',
      objects: [
        { id: 's1', emoji: '✨', startX: 0.15, startY: 0.85 },
        { id: 's2', emoji: '💫', startX: 0.4, startY: 0.85 },
        { id: 's3', emoji: '⚡', startX: 0.65, startY: 0.85 },
        { id: 's4', emoji: '🌀', startX: 0.9, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.2, y: 0.25, label: '📐' },
        { id: 'z2', x: 0.5, y: 0.25, label: '📐' },
        { id: 'z3', x: 0.8, y: 0.25, label: '📐' },
        { id: 'z4', x: 0.5, y: 0.55, label: '📐' }
      ],
      matches: [
        { objectId: 's1', zoneId: 'z1', hint: '가로 합 = 15' },
        { objectId: 's2', zoneId: 'z2', hint: '첫째 줄: 2, 7, 6' },
        { objectId: 's3', zoneId: 'z3', hint: '둘째 줄: 9, ?, 1' },
        { objectId: 's4', zoneId: 'z4', hint: '가로 합이 모두 15!' }
      ],
      question: '?에 들어갈 수는?',
      answer: '5'
    },
    {
      id: 9,
      title: '수열 추리',
      desc: '규칙을 찾아 빈칸을 채우세요',
      objects: [
        { id: 'a', emoji: '🔷', startX: 0.1, startY: 0.85 },
        { id: 'b', emoji: '🔶', startX: 0.3, startY: 0.85 },
        { id: 'c', emoji: '💠', startX: 0.5, startY: 0.85 },
        { id: 'd', emoji: '🔺', startX: 0.7, startY: 0.85 },
        { id: 'e', emoji: '🔻', startX: 0.9, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.15, y: 0.25, label: '🧩' },
        { id: 'z2', x: 0.35, y: 0.25, label: '🧩' },
        { id: 'z3', x: 0.55, y: 0.25, label: '🧩' },
        { id: 'z4', x: 0.75, y: 0.25, label: '🧩' },
        { id: 'z5', x: 0.5, y: 0.55, label: '🎯' }
      ],
      matches: [
        { objectId: 'a', zoneId: 'z1', hint: '수열: 1, 1, 2, 3, 5, 8...' },
        { objectId: 'b', zoneId: 'z2', hint: '규칙: 앞 두 수의 합' },
        { objectId: 'c', zoneId: 'z3', hint: '피보나치 수열!' },
        { objectId: 'd', zoneId: 'z4', hint: '8 다음: 5 + 8 = 13' },
        { objectId: 'e', zoneId: 'z5', hint: '13 다음은?' }
      ],
      question: '8, 13 다음 수는?',
      answer: '21'
    },
    {
      id: 10,
      title: '최종 관문',
      desc: '연립방정식을 풀어라!',
      objects: [
        { id: 'a', emoji: '🌟', startX: 0.1, startY: 0.85 },
        { id: 'b', emoji: '🌈', startX: 0.3, startY: 0.85 },
        { id: 'c', emoji: '🎪', startX: 0.5, startY: 0.85 },
        { id: 'd', emoji: '🎨', startX: 0.7, startY: 0.85 },
        { id: 'e', emoji: '🎯', startX: 0.9, startY: 0.85 }
      ],
      zones: [
        { id: 'z1', x: 0.15, y: 0.2, label: '📜' },
        { id: 'z2', x: 0.5, y: 0.2, label: '📜' },
        { id: 'z3', x: 0.85, y: 0.2, label: '📜' },
        { id: 'z4', x: 0.3, y: 0.55, label: '📜' },
        { id: 'z5', x: 0.7, y: 0.55, label: '📜' }
      ],
      matches: [
        { objectId: 'a', zoneId: 'z1', hint: 'X + Y = 12' },
        { objectId: 'b', zoneId: 'z2', hint: 'X - Y = 4' },
        { objectId: 'c', zoneId: 'z3', hint: 'X > Y' },
        { objectId: 'd', zoneId: 'z4', hint: 'X = 8, Y = 4' },
        { objectId: 'e', zoneId: 'z5', hint: '답 = X × Y' }
      ],
      question: 'X × Y = ?',
      answer: '32'
    }
  ],

  PARTICLES: {
    maxParticles: 120,
    correctCount: 10,
    clearCount: 25,
    sparkleInterval: 500
  }
};
