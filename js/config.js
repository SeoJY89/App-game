const CONFIG = {
  CANVAS: { WIDTH: 390, HEIGHT: 844 },

  COLORS: {
    text: '#e8e8e8',
    textDim: '#8a9aaa',
    textHint: '#f5e6a8',
    textDanger: '#e94560',
    accent: '#d4956a',
    accentGlow: 'rgba(212,149,106,0.4)',
    success: '#7ee8a0',
    panel: 'rgba(20,15,25,0.92)',
    panelBorder: 'rgba(212,149,106,0.4)',
    hotspotBg: 'rgba(255,255,255,0.06)',
    hotspotBorder: 'rgba(212,149,106,0.3)',
    hotspotHover: 'rgba(212,149,106,0.15)',
    overlay: 'rgba(0,0,0,0.7)',
    keypadBg: '#1a1520',
    keypadBtn: '#2a2530',
    keypadBtnPress: '#3a3540',
    inventorySlot: 'rgba(255,255,255,0.04)',
    inventorySlotActive: 'rgba(212,149,106,0.25)',
    white: '#FFFFFF'
  },

  LAYOUT: {
    headerH: 50,
    sceneBottom: 680,
    inventoryTop: 690,
    inventoryH: 80
  },

  // ====================================================
  // STAGES - Escape Room Puzzles
  // ====================================================
  STAGES: [
    // ============ STAGE 1: 교수의 서재 ============
    {
      id: 1,
      title: '교수의 서재',
      bgTop: '#3a2a40',
      bgBottom: '#0f0518',
      intro: '문이 잠겼다. 탈출할 방법을 찾아라.',
      hotspots: [
        {
          id: 'painting', x: 0.22, y: 0.2, size: 62,
          icon: '🖼️', label: '그림',
          onTap: (g) => {
            if (!g.flags.has('p1')) {
              g.flags.add('p1');
              return { msg: '낡은 풍경화. 뭔가 뒤에 숨겨진 것 같다.\n그림을 들여다본다...' };
            }
            if (!g.flags.has('p2')) {
              g.flags.add('p2');
              return { msg: '그림 뒤에 작은 쪽지가 붙어 있다:\n\n"책의 색 순서대로 숫자를 적어라.\n빨간색 → 초록색 → 파란색 → 노란색"' };
            }
            return { msg: '그림을 다시 살펴봐도 더 이상 없다.' };
          }
        },
        {
          id: 'clock', x: 0.78, y: 0.2, size: 58,
          icon: '🕰️', label: '시계',
          onTap: (g) => ({
            popup: { type: 'info', title: '벽시계', text: '시계 바늘이 멈춰 있다.\n시각: 09:42' }
          })
        },
        {
          id: 'books', x: 0.18, y: 0.52, size: 62,
          icon: '📚', label: '책장',
          onTap: (g) => ({
            popup: {
              type: 'books',
              title: '책장',
              books: [
                { color: '#5a7fc4', number: 5, label: '파란 책' },
                { color: '#e94560', number: 2, label: '빨간 책' },
                { color: '#f1c40f', number: 9, label: '노란 책' },
                { color: '#7ec97f', number: 7, label: '초록 책' }
              ]
            }
          })
        },
        {
          id: 'drawer', x: 0.5, y: 0.56, size: 62,
          icon: '🗄️', label: '서랍',
          onTap: (g) => {
            if (g.flags.has('drawer_open')) {
              return { msg: '서랍은 비어 있다.' };
            }
            return {
              popup: {
                type: 'keypad',
                title: '서랍 - 4자리 코드',
                length: 4,
                answer: '2757',
                hint: '빨 → 초 → 파 → 노'
              },
              onCorrect: (g) => {
                g.flags.add('drawer_open');
                g.addItem({ id: 'key', icon: '🗝️', label: '녹슨 열쇠' });
                return { msg: '서랍이 열렸다!\n안에 녹슨 열쇠가 있다.\n\n[열쇠를 획득했다]' };
              }
            };
          }
        },
        {
          id: 'door', x: 0.82, y: 0.58, size: 70,
          icon: '🚪', label: '문',
          onTap: (g) => {
            if (g.hasItem('key')) {
              g.removeItem('key');
              return { complete: true, msg: '녹슨 열쇠로 문을 열었다.\n탈출 성공! 🎉' };
            }
            return { msg: '문이 굳게 잠겨 있다.\n열쇠가 필요하다.' };
          }
        }
      ]
    },

    // ============ STAGE 2: 낡은 침실 ============
    {
      id: 2,
      title: '낡은 침실',
      bgTop: '#2a1a2e',
      bgBottom: '#0a0510',
      intro: '방은 먼지로 덮여 있다. 뭔가 숨겨져 있을 것이다.',
      hotspots: [
        {
          id: 'bed', x: 0.25, y: 0.25, size: 66,
          icon: '🛏️', label: '침대',
          onTap: (g) => {
            if (!g.flags.has('bed_1')) {
              g.flags.add('bed_1');
              return { msg: '낡은 침대. 매트리스 밑을 살펴본다...' };
            }
            if (!g.flags.has('bed_2')) {
              g.flags.add('bed_2');
              g.addItem({ id: 'medal', icon: '🏅', label: '이상한 메달' });
              return { msg: '매트리스 밑에 이상한 메달이 숨겨져 있다!\n\n[메달을 획득했다]' };
            }
            return { msg: '더 이상 아무것도 없다.' };
          }
        },
        {
          id: 'mirror', x: 0.75, y: 0.22, size: 62,
          icon: '🪞', label: '거울',
          onTap: (g) => ({
            popup: {
              type: 'info',
              title: '낡은 거울',
              text: '먼지 쌓인 거울. 자세히 보니 손가락으로 쓴 자국:\n\n"36" (거꾸로 보이는 숫자)'
            }
          })
        },
        {
          id: 'diary', x: 0.2, y: 0.56, size: 60,
          icon: '📓', label: '일기장',
          onTap: (g) => ({
            popup: {
              type: 'info',
              title: '먼지 덮인 일기',
              text: '마지막 페이지:\n\n"기차가 와서 내가 떠나기로 했다.\n다음 기차는 27번이다..."'
            }
          })
        },
        {
          id: 'box', x: 0.5, y: 0.58, size: 62,
          icon: '🎁', label: '보석함',
          onTap: (g) => {
            if (g.flags.has('box_open')) {
              return { msg: '보석함은 비어 있다.' };
            }
            return {
              popup: {
                type: 'info',
                title: '잠긴 보석함',
                text: '메달 모양의 홈이 파여 있다.\n메달이 필요해 보인다.'
              }
            };
          },
          onUseItem: (g, itemId) => {
            if (itemId === 'medal' && !g.flags.has('box_open')) {
              g.flags.add('box_open');
              g.removeItem('medal');
              return { msg: '메달을 홈에 끼우자 보석함이 열렸다!\n\n안에 종이가 있다:\n"거울의 수를 뒤집고 일기의 수와 합쳐라"' };
            }
            return null;
          }
        },
        {
          id: 'door', x: 0.82, y: 0.58, size: 70,
          icon: '🚪', label: '문',
          onTap: (g) => {
            if (g.flags.has('door_open')) {
              return { complete: true, msg: '탈출 성공! 🎉' };
            }
            return {
              popup: {
                type: 'keypad',
                title: '출입문 - 4자리 코드',
                length: 4,
                answer: '6327',
                hint: '거울(뒤집기) + 기차'
              },
              onCorrect: (g) => {
                g.flags.add('door_open');
                return { complete: true, msg: '문이 열렸다!\n탈출 성공! 🎉' };
              }
            };
          }
        }
      ]
    },

    // ============ STAGE 3: 비밀의 실험실 ============
    {
      id: 3,
      title: '비밀의 실험실',
      bgTop: '#1a2a3a',
      bgBottom: '#050a15',
      intro: '누군가의 실험실. 도구를 조합해야 할 것 같다.',
      hotspots: [
        {
          id: 'tubes', x: 0.2, y: 0.2, size: 60,
          icon: '🧪', label: '시험관',
          onTap: (g) => ({
            popup: {
              type: 'info',
              title: '시험관들',
              text: '4개의 시험관:\n\n🔴 빨강: 레벨 3\n🟢 초록: 레벨 8\n🔵 파랑: 레벨 1\n🟡 노랑: 레벨 5'
            }
          })
        },
        {
          id: 'notebook', x: 0.8, y: 0.2, size: 58,
          icon: '📖', label: '연구노트',
          onTap: (g) => ({
            popup: {
              type: 'info',
              title: '연구 노트',
              text: '마지막 기록:\n\n"비밀번호는 시험관 레벨을\n오름차순으로 정렬한 것"'
            }
          })
        },
        {
          id: 'cabinet', x: 0.2, y: 0.56, size: 62,
          icon: '🗃️', label: '캐비닛',
          onTap: (g) => {
            if (g.flags.has('cabinet_open')) {
              return { msg: '캐비닛은 비어있다.' };
            }
            return {
              popup: {
                type: 'keypad',
                title: '캐비닛 - 4자리 코드',
                length: 4,
                answer: '1358',
                hint: '시험관 레벨 오름차순'
              },
              onCorrect: (g) => {
                g.flags.add('cabinet_open');
                g.addItem({ id: 'flashlight', icon: '🔦', label: '손전등 (꺼짐)' });
                return { msg: '캐비닛이 열렸다!\n안에 손전등이 있다 (건전지 없음).\n\n[손전등을 획득했다]' };
              }
            };
          }
        },
        {
          id: 'desk', x: 0.5, y: 0.56, size: 60,
          icon: '📐', label: '책상',
          onTap: (g) => {
            if (!g.flags.has('battery_found')) {
              g.flags.add('battery_found');
              g.addItem({ id: 'battery', icon: '🔋', label: '건전지' });
              return { msg: '책상 서랍 구석에서 건전지를 발견했다!\n\n[건전지를 획득했다]' };
            }
            return { msg: '책상을 다시 살펴봐도 더 이상 없다.' };
          }
        },
        {
          id: 'darkwall', x: 0.82, y: 0.25, size: 60,
          icon: '⬛', label: '어두운 벽',
          onTap: (g) => {
            if (g.flags.has('wall_lit')) {
              return {
                popup: {
                  type: 'info',
                  title: '벽의 낙서',
                  text: '"출구 코드: 9047"'
                }
              };
            }
            return { msg: '너무 어두워서 아무것도 보이지 않는다.\n빛이 필요하다.' };
          },
          onUseItem: (g, itemId) => {
            if (itemId === 'flashlight_on' && !g.flags.has('wall_lit')) {
              g.flags.add('wall_lit');
              return { msg: '손전등으로 벽을 비추자 낙서가 보인다!\n\n"출구 코드: 9047"' };
            }
            if (itemId === 'flashlight') {
              return { msg: '손전등이 꺼져 있다. 건전지가 필요하다.' };
            }
            return null;
          }
        },
        {
          id: 'door', x: 0.82, y: 0.6, size: 70,
          icon: '🚪', label: '출구',
          onTap: (g) => {
            if (g.flags.has('door_open')) {
              return { complete: true, msg: '탈출 성공! 🎉' };
            }
            return {
              popup: {
                type: 'keypad',
                title: '출구 - 4자리 코드',
                length: 4,
                answer: '9047',
                hint: '어두운 벽에 숨겨져 있다'
              },
              onCorrect: (g) => {
                g.flags.add('door_open');
                return { complete: true, msg: '문이 열렸다!\n탈출 성공! 🎉' };
              }
            };
          }
        }
      ],
      // custom: combining flashlight + battery
      combineItems: (g, a, b) => {
        const ids = [a, b].sort().join(',');
        if (ids === 'battery,flashlight') {
          g.removeItem('flashlight');
          g.removeItem('battery');
          g.addItem({ id: 'flashlight_on', icon: '🔦', label: '손전등 (켜짐)' });
          return { msg: '건전지를 손전등에 넣었다!\n손전등이 켜졌다.\n\n[켜진 손전등 획득]' };
        }
        return null;
      }
    },

    // ============ STAGE 4: 도서관 ============
    {
      id: 4,
      title: '잊혀진 도서관',
      bgTop: '#2a1f15',
      bgBottom: '#0a0505',
      intro: '먼지 쌓인 도서관. 책들 사이에 단서가 있다.',
      hotspots: [
        {
          id: 'globe', x: 0.2, y: 0.2, size: 60,
          icon: '🌍', label: '지구본',
          onTap: (g) => {
            if (!g.flags.has('globe_spun')) {
              g.flags.add('globe_spun');
              return { msg: '지구본을 돌려본다.\n뭔가가 안에서 달그락거린다...' };
            }
            if (!g.flags.has('globe_open')) {
              g.flags.add('globe_open');
              g.addItem({ id: 'scroll', icon: '📜', label: '고대 두루마리' });
              return { msg: '지구본 윗부분이 열린다!\n안에서 두루마리가 나왔다.\n\n[두루마리를 획득했다]' };
            }
            return { msg: '지구본 안은 비어있다.' };
          }
        },
        {
          id: 'bookshelf', x: 0.5, y: 0.18, size: 66,
          icon: '📚', label: '책장',
          onTap: (g) => ({
            popup: {
              type: 'info',
              title: '고대 도서관',
              text: '수많은 책들. 네 권이 튀어나와 있다:\n\n1. "불의 역사" - 페이지 147\n2. "물의 신비" - 페이지 32\n3. "땅의 기록" - 페이지 891\n4. "바람의 전설" - 페이지 605\n\n한 권의 숫자가 답이다.'
            }
          })
        },
        {
          id: 'candle', x: 0.8, y: 0.2, size: 58,
          icon: '🕯️', label: '촛대',
          onTap: (g) => {
            if (g.flags.has('scroll_read')) {
              return {
                popup: {
                  type: 'info',
                  title: '촛대 받침',
                  text: '"불의 책 페이지를 찾아라"\n\n받침 아래 작은 글씨.'
                }
              };
            }
            return { msg: '낡은 촛대. 먼지가 쌓여 있다.' };
          }
        },
        {
          id: 'chest', x: 0.25, y: 0.56, size: 64,
          icon: '🧰', label: '나무 상자',
          onTap: (g) => {
            if (g.flags.has('chest_open')) {
              return { msg: '상자는 비어있다.' };
            }
            return {
              popup: {
                type: 'keypad',
                title: '나무 상자 - 3자리 코드',
                length: 3,
                answer: '147',
                hint: '불의 책'
              },
              onCorrect: (g) => {
                g.flags.add('chest_open');
                g.addItem({ id: 'goldkey', icon: '🔑', label: '금빛 열쇠' });
                return { msg: '상자가 열렸다!\n안에 금빛 열쇠가 있다.\n\n[금빛 열쇠를 획득했다]' };
              }
            };
          }
        },
        {
          id: 'altar', x: 0.55, y: 0.58, size: 60,
          icon: '⛩️', label: '제단',
          onTap: (g) => {
            if (g.flags.has('scroll_read')) {
              return { msg: '두루마리가 제단 위에 놓여있다.' };
            }
            return { msg: '빈 제단. 뭔가를 올려놓아야 할 것 같다.' };
          },
          onUseItem: (g, itemId) => {
            if (itemId === 'scroll' && !g.flags.has('scroll_read')) {
              g.flags.add('scroll_read');
              g.removeItem('scroll');
              return { msg: '두루마리를 제단에 올리자 빛이 난다!\n\n두루마리에 적힌 글:\n"불의 책에 답이 있다.\n촛대 아래를 봐라."' };
            }
            return null;
          }
        },
        {
          id: 'door', x: 0.82, y: 0.6, size: 70,
          icon: '🚪', label: '거대한 문',
          onTap: (g) => {
            if (g.hasItem('goldkey')) {
              g.removeItem('goldkey');
              return { complete: true, msg: '금빛 열쇠가 맞물린다!\n거대한 문이 열렸다.\n\n탈출 성공! 🎉' };
            }
            return { msg: '거대한 문. 특별한 열쇠가 필요해 보인다.' };
          }
        }
      ]
    },

    // ============ STAGE 5: 최후의 방 ============
    {
      id: 5,
      title: '최후의 방',
      bgTop: '#25152a',
      bgBottom: '#050008',
      intro: '이것이 마지막 방이다. 모든 것을 걸어야 한다.',
      hotspots: [
        {
          id: 'skull', x: 0.2, y: 0.18, size: 64,
          icon: '💀', label: '해골',
          onTap: (g) => ({
            popup: {
              type: 'info',
              title: '해골의 속삭임',
              text: '"세 개의 열쇠가 필요하다..."\n\n"별 - 달 - 태양,\n순서대로 맞춰야만..."'
            }
          })
        },
        {
          id: 'star_pedestal', x: 0.5, y: 0.18, size: 58,
          icon: '⭐', label: '별 제단',
          onTap: (g) => {
            if (g.flags.has('star_solved')) {
              return { msg: '별이 빛나고 있다.' };
            }
            return {
              popup: {
                type: 'keypad',
                title: '별의 퍼즐',
                length: 2,
                answer: '11',
                hint: '별의 뾰족한 끝 개수 + 해골의 눈'
              },
              onCorrect: (g) => {
                g.flags.add('star_solved');
                return { msg: '별이 밝게 빛난다! ⭐' };
              }
            };
          }
        },
        {
          id: 'moon_pedestal', x: 0.8, y: 0.18, size: 58,
          icon: '🌙', label: '달 제단',
          onTap: (g) => {
            if (g.flags.has('moon_solved')) {
              return { msg: '달이 빛나고 있다.' };
            }
            if (!g.flags.has('star_solved')) {
              return { msg: '제단에 먼저 별을 밝혀야 할 것 같다.' };
            }
            return {
              popup: {
                type: 'keypad',
                title: '달의 퍼즐',
                length: 2,
                answer: '28',
                hint: '달이 차고 기우는 주기'
              },
              onCorrect: (g) => {
                g.flags.add('moon_solved');
                return { msg: '달이 밝게 빛난다! 🌙' };
              }
            };
          }
        },
        {
          id: 'sun_pedestal', x: 0.5, y: 0.5, size: 60,
          icon: '☀️', label: '태양 제단',
          onTap: (g) => {
            if (g.flags.has('sun_solved')) {
              return { msg: '태양이 빛나고 있다.' };
            }
            if (!g.flags.has('moon_solved')) {
              return { msg: '먼저 달을 밝혀야 한다.' };
            }
            return {
              popup: {
                type: 'keypad',
                title: '태양의 퍼즐',
                length: 3,
                answer: '365',
                hint: '태양을 도는 지구의 하루 수'
              },
              onCorrect: (g) => {
                g.flags.add('sun_solved');
                return { msg: '태양이 찬란히 빛난다! ☀️\n\n세 제단이 모두 빛난다...' };
              }
            };
          }
        },
        {
          id: 'altar', x: 0.2, y: 0.55, size: 62,
          icon: '🏺', label: '중앙 제단',
          onTap: (g) => {
            if (g.flags.has('sun_solved') && !g.flags.has('orb_taken')) {
              g.flags.add('orb_taken');
              g.addItem({ id: 'orb', icon: '🔮', label: '빛나는 구슬' });
              return { msg: '중앙 제단에서 빛나는 구슬이 솟아올랐다!\n\n[구슬을 획득했다]' };
            }
            if (g.flags.has('orb_taken')) {
              return { msg: '제단에서 구슬을 이미 얻었다.' };
            }
            return { msg: '비어있는 제단. 세 빛이 모이면 뭔가가 나타날 것 같다.' };
          }
        },
        {
          id: 'door', x: 0.82, y: 0.58, size: 72,
          icon: '🚪', label: '마지막 문',
          onTap: (g) => {
            if (g.flags.has('door_open')) {
              return { complete: true, msg: '탈출 성공! 🎉\n\n모든 방을 탈출했다!' };
            }
            return { msg: '거대한 문에 원형 구멍이 있다.\n뭔가를 끼워야 한다.' };
          },
          onUseItem: (g, itemId) => {
            if (itemId === 'orb') {
              g.flags.add('door_open');
              g.removeItem('orb');
              return {
                complete: true,
                msg: '빛나는 구슬이 구멍에 맞는다.\n문이 서서히 열린다...\n\n최종 탈출 성공! 🎉🏆\n\n모든 방을 정복했다!'
              };
            }
            return null;
          }
        }
      ]
    }
  ]
};
