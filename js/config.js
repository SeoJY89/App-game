const CONFIG = {
  CANVAS: { WIDTH: 390, HEIGHT: 844 },

  COLORS: {
    bgTop: '#1b2530',
    bgBottom: '#0e1820',
    panel: '#2a3f52',
    panelDark: '#1f2f3e',
    gridLine: '#5a7a92',
    gridLineDim: '#3a5a72',
    line: '#f5e6a8',
    lineGlow: 'rgba(245,230,168,0.4)',
    lineStart: '#f5e6a8',
    success: '#7ee8a0',
    successGlow: 'rgba(126,232,160,0.5)',
    fail: '#e94560',
    text: '#e8e8e8',
    textDim: '#7a8a9a',
    square_black: '#1a1a1a',
    square_white: '#f0f0f0',
    star_red: '#e94560',
    star_blue: '#4a90e2',
    star_yellow: '#f1c40f',
    white: '#FFFFFF'
  },

  // Puzzles - rules are NOT explained, player discovers by observation.
  // All puzzles verified solvable with careful design.
  PUZZLES: [
    // === CHAPTER A: Line drawing basics ===
    {
      id: 1, chapter: 'A', title: '첫 걸음',
      cols: 2, rows: 2,
      start: { col: 0, row: 2 },
      end: { col: 2, row: 0 },
      cells: [[null, null], [null, null]],
      hexDots: []
    },
    {
      id: 2, chapter: 'A', title: '길 찾기',
      cols: 3, rows: 3,
      start: { col: 0, row: 3 },
      end: { col: 3, row: 0 },
      cells: [[null,null,null],[null,null,null],[null,null,null]],
      hexDots: []
    },

    // === CHAPTER B: Hexagon dots (line must pass through) ===
    {
      id: 3, chapter: 'B', title: '필수 경로',
      cols: 2, rows: 2,
      start: { col: 0, row: 2 },
      end: { col: 2, row: 0 },
      cells: [[null,null],[null,null]],
      hexDots: [{ col: 1, row: 1, dir: 'h' }]
    },
    {
      id: 4, chapter: 'B', title: '두 점을 거쳐',
      cols: 3, rows: 3,
      start: { col: 0, row: 3 },
      end: { col: 3, row: 0 },
      cells: [[null,null,null],[null,null,null],[null,null,null]],
      hexDots: [
        { col: 1, row: 2, dir: 'h' },
        { col: 2, row: 1, dir: 'h' }
      ]
    },
    {
      id: 5, chapter: 'B', title: '꼬인 길',
      cols: 3, rows: 3,
      start: { col: 0, row: 3 },
      end: { col: 3, row: 0 },
      cells: [[null,null,null],[null,null,null],[null,null,null]],
      hexDots: [
        { col: 0, row: 1, dir: 'h' },
        { col: 1, row: 1, dir: 'v' },
        { col: 2, row: 2, dir: 'h' }
      ]
    },

    // === CHAPTER C: Separation (black/white squares) ===
    {
      id: 6, chapter: 'C', title: '분리',
      cols: 2, rows: 2,
      start: { col: 0, row: 2 },
      end: { col: 2, row: 0 },
      cells: [
        [{ type: 'square', color: 'black' }, null],
        [null, { type: 'square', color: 'white' }]
      ],
      hexDots: []
    },
    {
      id: 7, chapter: 'C', title: '위와 아래',
      cols: 3, rows: 3,
      start: { col: 0, row: 3 },
      end: { col: 3, row: 0 },
      cells: [
        [{type:'square',color:'black'}, null, {type:'square',color:'black'}],
        [null, null, null],
        [{type:'square',color:'white'}, null, {type:'square',color:'white'}]
      ],
      hexDots: []
    },
    {
      id: 8, chapter: 'C', title: '네 영역',
      cols: 4, rows: 4,
      start: { col: 0, row: 4 },
      end: { col: 4, row: 0 },
      cells: [
        [{type:'square',color:'black'},{type:'square',color:'black'},null,null],
        [null,null,null,null],
        [null,null,null,null],
        [null,null,{type:'square',color:'white'},{type:'square',color:'white'}]
      ],
      hexDots: []
    },

    // === CHAPTER D: Stars (pairs - exactly 2 per color per region) ===
    {
      id: 9, chapter: 'D', title: '별의 쌍',
      cols: 3, rows: 3,
      start: { col: 0, row: 3 },
      end: { col: 3, row: 0 },
      cells: [
        [{type:'star',color:'red'}, null, {type:'star',color:'red'}],
        [null, null, null],
        [null, null, null]
      ],
      hexDots: []
    },
    {
      id: 10, chapter: 'D', title: '두 가지 쌍',
      cols: 3, rows: 3,
      start: { col: 0, row: 3 },
      end: { col: 3, row: 0 },
      cells: [
        [{type:'star',color:'red'}, null, {type:'star',color:'red'}],
        [null, null, null],
        [{type:'star',color:'blue'}, null, {type:'star',color:'blue'}]
      ],
      hexDots: []
    },
    {
      id: 11, chapter: 'D', title: '네 별의 춤',
      cols: 4, rows: 4,
      start: { col: 0, row: 4 },
      end: { col: 4, row: 0 },
      cells: [
        [{type:'star',color:'red'},null,null,{type:'star',color:'red'}],
        [null,null,null,null],
        [null,null,null,null],
        [{type:'star',color:'red'},null,null,{type:'star',color:'red'}]
      ],
      hexDots: []
    },

    // === CHAPTER E: Combined rules ===
    {
      id: 12, chapter: 'E', title: '별과 분리',
      cols: 3, rows: 3,
      start: { col: 0, row: 3 },
      end: { col: 3, row: 0 },
      cells: [
        [{type:'star',color:'red'}, null, {type:'star',color:'red'}],
        [null, null, null],
        [{type:'square',color:'white'}, null, {type:'square',color:'black'}]
      ],
      hexDots: []
    },
    {
      id: 13, chapter: 'E', title: '점과 색',
      cols: 3, rows: 3,
      start: { col: 0, row: 3 },
      end: { col: 3, row: 0 },
      cells: [
        [{type:'square',color:'black'}, null, {type:'square',color:'black'}],
        [null, null, null],
        [{type:'square',color:'white'}, null, {type:'square',color:'white'}]
      ],
      hexDots: [{ col: 2, row: 1, dir: 'h' }]
    },
    {
      id: 14, chapter: 'E', title: '세 가지 규칙',
      cols: 4, rows: 4,
      start: { col: 0, row: 4 },
      end: { col: 4, row: 0 },
      cells: [
        [{type:'square',color:'black'},null,null,{type:'square',color:'black'}],
        [{type:'star',color:'red'},null,null,{type:'star',color:'red'}],
        [null,null,null,null],
        [{type:'square',color:'white'},null,null,{type:'square',color:'white'}]
      ],
      hexDots: []
    },
    {
      id: 15, chapter: 'E', title: '최종 시험',
      cols: 4, rows: 4,
      start: { col: 0, row: 4 },
      end: { col: 4, row: 0 },
      cells: [
        [{type:'square',color:'black'},{type:'star',color:'red'},null,null],
        [{type:'star',color:'red'},null,null,null],
        [null,null,null,{type:'square',color:'white'}],
        [null,null,{type:'square',color:'white'},null]
      ],
      hexDots: [{ col: 2, row: 2, dir: 'h' }]
    }
  ],

  LAYOUT: {
    headerH: 55,
    gridTop: 90,
    gridBottom: 700,
    footerTop: 720
  }
};
