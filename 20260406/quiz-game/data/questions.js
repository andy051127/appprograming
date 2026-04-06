const QUESTIONS = [

  // ───────────────────────────────────────────
  // 한국사 (10문제)
  // ───────────────────────────────────────────

  // 고대 — easy
  {
    id: 1,
    category: "한국사",
    subtopic: "고대",
    difficulty: "easy",
    question: "삼국시대의 세 나라가 올바르게 짝지어진 것은?",
    choices: ["고구려, 백제, 신라", "고구려, 발해, 신라", "백제, 가야, 신라", "고려, 백제, 신라"],
    answer: 0,
    explanation: "삼국시대는 고구려·백제·신라가 한반도에서 경쟁하던 시기입니다. 발해는 통일신라 이후 세워진 국가입니다."
  },

  // 고대 — medium
  {
    id: 2,
    category: "한국사",
    subtopic: "고대",
    difficulty: "medium",
    question: "신라가 당나라 세력을 한반도에서 몰아내고 삼국통일을 실질적으로 완성한 해는?",
    choices: ["562년", "660년", "668년", "676년"],
    answer: 3,
    explanation: "신라는 660년 백제, 668년 고구려를 멸망시켰지만, 한반도에 남아 있던 당나라 세력을 676년 기벌포 전투에서 몰아내며 삼국통일을 실질적으로 완성했습니다."
  },

  // 고려 — easy
  {
    id: 3,
    category: "한국사",
    subtopic: "고려",
    difficulty: "easy",
    question: "고려를 건국한 인물은?",
    choices: ["견훤", "궁예", "왕건", "김부식"],
    answer: 2,
    explanation: "왕건은 918년 고려를 건국하고 태조가 되었습니다. 견훤은 후백제, 궁예는 후고구려(태봉)를 세웠습니다."
  },

  // 고려 — medium
  {
    id: 4,
    category: "한국사",
    subtopic: "고려",
    difficulty: "medium",
    question: "고려 무신정변이 일어난 연도는?",
    choices: ["918년", "993년", "1170년", "1232년"],
    answer: 2,
    explanation: "1170년 정중부 등 무신들이 문신 지배에 반발하여 정변을 일으키고 권력을 장악했습니다. 이후 약 100년간 무신 정권 시대가 이어졌습니다."
  },

  // 조선 — easy
  {
    id: 5,
    category: "한국사",
    subtopic: "조선",
    difficulty: "easy",
    question: "조선을 건국한 인물은?",
    choices: ["왕건", "이성계", "정도전", "이방원"],
    answer: 1,
    explanation: "이성계는 1392년 고려를 무너뜨리고 조선을 건국하여 태조가 되었습니다. 수도는 한양(현재의 서울)으로 정했습니다."
  },

  // 조선 — medium
  {
    id: 6,
    category: "한국사",
    subtopic: "조선",
    difficulty: "medium",
    question: "임진왜란이 시작된 연도는?",
    choices: ["1388년", "1592년", "1627년", "1636년"],
    answer: 1,
    explanation: "1592년 일본의 도요토미 히데요시가 조선을 침략하면서 임진왜란이 시작되었습니다. 이순신 장군의 활약으로 왜군을 막아냈습니다."
  },

  // 조선 — hard
  {
    id: 7,
    category: "한국사",
    subtopic: "조선",
    difficulty: "hard",
    question: "조선 후기 실학자로, 『목민심서』를 저술한 인물은?",
    choices: ["이황", "이이", "정약용", "박지원"],
    answer: 2,
    explanation: "정약용(다산)은 조선 후기 실학의 집대성자로, 『목민심서』, 『흠흠신서』, 『경세유표』 등 500여 권의 저술을 남겼습니다."
  },

  // 근현대 — easy
  {
    id: 8,
    category: "한국사",
    subtopic: "근현대",
    difficulty: "easy",
    question: "3·1 운동이 일어난 연도는?",
    choices: ["1910년", "1919년", "1945년", "1950년"],
    answer: 1,
    explanation: "1919년 3월 1일 일제 강점기에 조선 민족이 독립을 요구한 대규모 만세 운동이 전국적으로 일어났습니다."
  },

  // 근현대 — medium
  {
    id: 9,
    category: "한국사",
    subtopic: "근현대",
    difficulty: "medium",
    question: "대한민국 임시정부가 수립된 도시는?",
    choices: ["베이징", "충칭", "상하이", "도쿄"],
    answer: 2,
    explanation: "1919년 4월 대한민국 임시정부가 중국 상하이에 수립되었습니다. 이후 일제의 탄압을 피해 충칭으로 이전했습니다."
  },

  // 근현대 — hard
  {
    id: 10,
    category: "한국사",
    subtopic: "근현대",
    difficulty: "hard",
    question: "6·25 전쟁 당시 인천상륙작전을 지휘한 유엔군 사령관은?",
    choices: ["드와이트 아이젠하워", "더글러스 맥아더", "오마 브래들리", "마크 클라크"],
    answer: 1,
    explanation: "1950년 9월 15일 더글러스 맥아더 장군이 지휘한 인천상륙작전은 전세를 역전시킨 결정적 작전이었습니다."
  },

  // ───────────────────────────────────────────
  // 과학 (10문제)
  // ───────────────────────────────────────────

  // 물리 — easy
  {
    id: 11,
    category: "과학",
    subtopic: "물리",
    difficulty: "easy",
    question: "뉴턴의 운동 제1법칙을 무엇이라 부르는가?",
    choices: ["가속도의 법칙", "작용·반작용의 법칙", "관성의 법칙", "만유인력의 법칙"],
    answer: 2,
    explanation: "뉴턴의 운동 제1법칙은 외부 힘이 없으면 물체가 현재의 운동 상태를 유지하려는 성질인 '관성의 법칙'입니다."
  },

  // 물리 — medium
  {
    id: 12,
    category: "과학",
    subtopic: "물리",
    difficulty: "medium",
    question: "빛의 진공 중 속도에 가장 가까운 값은?",
    choices: ["약 30만 km/s", "약 3만 km/s", "약 300만 km/s", "약 3,000 km/s"],
    answer: 0,
    explanation: "진공에서 빛의 속도는 약 299,792,458 m/s로, 약 30만 km/s입니다. 이 값은 물리학의 기본 상수 c로 표기됩니다."
  },

  // 물리 — hard
  {
    id: 13,
    category: "과학",
    subtopic: "물리",
    difficulty: "hard",
    question: "전자기 유도 현상을 발견하여 발전기의 원리를 정립한 과학자는?",
    choices: ["제임스 와트", "마이클 패러데이", "앙드레 앙페르", "알레산드로 볼타"],
    answer: 1,
    explanation: "마이클 패러데이는 1831년 전자기 유도 현상을 발견했습니다. 코일 주변의 자기장 변화가 전류를 만든다는 이 원리는 현대 발전기의 기초입니다."
  },

  // 화학 — easy
  {
    id: 14,
    category: "과학",
    subtopic: "화학",
    difficulty: "easy",
    question: "물의 화학식은?",
    choices: ["CO₂", "H₂O", "NaCl", "O₂"],
    answer: 1,
    explanation: "물은 수소(H) 원자 2개와 산소(O) 원자 1개로 이루어진 화합물로 화학식은 H₂O입니다."
  },

  // 화학 — medium
  {
    id: 15,
    category: "과학",
    subtopic: "화학",
    difficulty: "medium",
    question: "pH 7보다 낮은 용액의 성질은?",
    choices: ["중성", "염기성", "산성", "비전해질"],
    answer: 2,
    explanation: "pH 7은 중성, 7보다 낮으면 산성, 7보다 높으면 염기성입니다. 산성 용액은 수소 이온(H⁺) 농도가 높습니다."
  },

  // 생물 — easy
  {
    id: 16,
    category: "과학",
    subtopic: "생물",
    difficulty: "easy",
    question: "식물이 광합성을 할 때 필요한 두 가지 원료는?",
    choices: ["산소와 포도당", "이산화탄소와 물", "산소와 물", "질소와 이산화탄소"],
    answer: 1,
    explanation: "식물은 이산화탄소(CO₂)와 물(H₂O)을 원료로 빛에너지를 이용하여 포도당과 산소를 생성합니다."
  },

  // 생물 — medium
  {
    id: 17,
    category: "과학",
    subtopic: "생물",
    difficulty: "medium",
    question: "세포의 유전 정보를 담고 있는 물질은?",
    choices: ["단백질", "지질", "DNA", "탄수화물"],
    answer: 2,
    explanation: "DNA(디옥시리보핵산)는 세포핵 안의 염색체에 존재하며, 유전 정보를 저장하고 다음 세대로 전달합니다."
  },

  // 생물 — hard
  {
    id: 18,
    category: "과학",
    subtopic: "생물",
    difficulty: "hard",
    question: "멘델의 유전 법칙 중, 한 쌍의 대립유전자가 생식세포 형성 시 각각 나뉘어 서로 다른 생식세포로 들어간다는 법칙은?",
    choices: ["우열의 법칙", "분리의 법칙", "독립의 법칙", "연관의 법칙"],
    answer: 1,
    explanation: "분리의 법칙은 한 쌍의 대립유전자가 감수분열 시 분리되어 각각 다른 생식세포로 들어가는 현상입니다. 독립의 법칙은 서로 다른 두 쌍의 대립유전자가 서로 영향 없이 독립적으로 분리된다는 별개의 법칙입니다."
  },

  // 지구과학 — easy
  {
    id: 19,
    category: "과학",
    subtopic: "지구과학",
    difficulty: "easy",
    question: "지구의 표면을 이루는 여러 개의 조각을 무엇이라 하는가?",
    choices: ["맨틀", "지각", "판(플레이트)", "핵"],
    answer: 2,
    explanation: "지구의 표면은 여러 개의 판(플레이트)으로 나뉘어 있으며, 이 판들이 움직이면서 지진·화산·산맥 형성 등의 지질 현상이 일어납니다."
  },

  // 지구과학 — medium
  {
    id: 20,
    category: "과학",
    subtopic: "지구과학",
    difficulty: "medium",
    question: "지구 온난화의 주요 원인으로 꼽히는 온실가스는?",
    choices: ["산소(O₂)", "질소(N₂)", "이산화탄소(CO₂)", "아르곤(Ar)"],
    answer: 2,
    explanation: "화석연료 연소 등으로 발생하는 이산화탄소(CO₂)는 대기 중 열을 가두는 온실 효과를 일으켜 지구 온난화의 주요 원인이 됩니다."
  },

  // ───────────────────────────────────────────
  // 지리 (10문제)
  // ───────────────────────────────────────────

  // 세계 수도 — easy
  {
    id: 21,
    category: "지리",
    subtopic: "세계수도",
    difficulty: "easy",
    question: "프랑스의 수도는?",
    choices: ["런던", "베를린", "파리", "마드리드"],
    answer: 2,
    explanation: "파리는 프랑스의 수도이자 최대 도시입니다. 에펠탑, 루브르 박물관 등 세계적인 명소가 있습니다."
  },

  // 세계 수도 — medium
  {
    id: 22,
    category: "지리",
    subtopic: "세계수도",
    difficulty: "medium",
    question: "브라질의 수도는?",
    choices: ["상파울루", "리우데자네이루", "브라질리아", "살바도르"],
    answer: 2,
    explanation: "브라질의 수도는 브라질리아입니다. 최대 도시인 상파울루나 리우데자네이루가 수도로 혼동되기 쉽지만, 1960년 내륙에 계획 도시로 건설된 브라질리아가 수도입니다."
  },

  // 세계 수도 — hard
  {
    id: 23,
    category: "지리",
    subtopic: "세계수도",
    difficulty: "hard",
    question: "오스트레일리아(호주)의 수도는?",
    choices: ["시드니", "멜버른", "브리즈번", "캔버라"],
    answer: 3,
    explanation: "호주의 수도는 캔버라입니다. 시드니와 멜버른이 최대 도시이지만, 두 도시 간 수도 유치 경쟁을 피하기 위해 1913년 캔버라를 계획 수도로 건설했습니다."
  },

  // 지형·자연환경 — easy
  {
    id: 24,
    category: "지리",
    subtopic: "지형·자연환경",
    difficulty: "easy",
    question: "전통적인 측정 기준으로 세계에서 가장 긴 강은?",
    choices: ["아마존강", "나일강", "미시시피강", "양쯔강"],
    answer: 1,
    explanation: "전통적 측정 기준으로 나일강(약 6,650km)이 세계에서 가장 긴 강으로 인정받고 있습니다. 다만 측정 방법에 따라 아마존강(약 6,400~7,062km)이 더 길다는 연구도 있어, 두 강의 길이 순위는 학계에서 일부 논쟁 중입니다."
  },

  // 지형·자연환경 — medium
  {
    id: 25,
    category: "지리",
    subtopic: "지형·자연환경",
    difficulty: "medium",
    question: "세계에서 가장 넓은 열사막(hot desert)은?",
    choices: ["고비 사막", "아라비아 사막", "사하라 사막", "칼라하리 사막"],
    answer: 2,
    explanation: "사하라 사막은 면적 약 940만 km²로 세계에서 가장 넓은 열사막입니다. 냉사막(cold desert)까지 포함하면 남극 대륙(약 1,400만 km²)이 더 넓어 사막의 종류를 구분하는 것이 중요합니다."
  },

  // 지형·자연환경 — hard
  {
    id: 26,
    category: "지리",
    subtopic: "지형·자연환경",
    difficulty: "hard",
    question: "최대 수심 기준으로 세계에서 가장 깊은 호수는?",
    choices: ["카스피해", "슈피리어호", "바이칼호", "탕가니카호"],
    answer: 2,
    explanation: "러시아 시베리아에 위치한 바이칼호는 최대 수심 1,642m로 세계에서 가장 깊은 호수입니다. 세계 담수의 약 20%를 차지합니다."
  },

  // 국가·문화권 — easy
  {
    id: 27,
    category: "지리",
    subtopic: "국가·문화권",
    difficulty: "easy",
    question: "아시아 대륙에 속하지 않는 나라는?",
    choices: ["인도", "태국", "이집트", "몽골"],
    answer: 2,
    explanation: "이집트는 아프리카 대륙에 위치한 나라입니다. 시나이반도 일부가 아시아와 접하지만 대부분의 영토는 아프리카에 속합니다."
  },

  // 국가·문화권 — medium
  {
    id: 28,
    category: "지리",
    subtopic: "국가·문화권",
    difficulty: "medium",
    question: "스페인어를 공용어로 사용하지 않는 나라는?",
    choices: ["멕시코", "아르헨티나", "브라질", "콜롬비아"],
    answer: 2,
    explanation: "브라질은 포르투갈어를 공용어로 사용합니다. 브라질은 포르투갈의 식민지였기 때문에 주변 남미 국가들과 달리 포르투갈어를 씁니다."
  },

  // 한국 지리 — easy
  {
    id: 29,
    category: "지리",
    subtopic: "한국지리",
    difficulty: "easy",
    question: "남북한을 포함한 한반도에서 가장 높은 산은?",
    choices: ["지리산", "설악산", "한라산", "백두산"],
    answer: 3,
    explanation: "백두산(2,744m)은 한반도에서 가장 높은 산으로, 현재 북한과 중국 국경에 위치해 있습니다. 대한민국(남한) 영토에서 가장 높은 산은 제주도의 한라산(1,950m)입니다."
  },

  // 한국 지리 — medium
  {
    id: 30,
    category: "지리",
    subtopic: "한국지리",
    difficulty: "medium",
    question: "우리나라에서 면적이 가장 큰 섬은?",
    choices: ["울릉도", "거제도", "제주도", "강화도"],
    answer: 2,
    explanation: "제주도는 면적 약 1,849km²로 우리나라에서 가장 큰 섬입니다. 유네스코 세계자연유산에도 등재되어 있습니다."
  },

  // ───────────────────────────────────────────
  // 일반상식 (10문제)
  // ───────────────────────────────────────────

  // 사회·경제 — easy
  {
    id: 31,
    category: "일반상식",
    subtopic: "사회·경제",
    difficulty: "easy",
    question: "국내총생산을 뜻하는 경제 용어는?",
    choices: ["GNP", "GDP", "IMF", "CPI"],
    answer: 1,
    explanation: "GDP(Gross Domestic Product, 국내총생산)는 일정 기간 한 나라 안에서 생산된 모든 최종 재화와 서비스의 시장 가치 합계입니다."
  },

  // 사회·경제 — medium
  {
    id: 32,
    category: "일반상식",
    subtopic: "사회·경제",
    difficulty: "medium",
    question: "물가가 지속적으로 하락하는 현상을 무엇이라 하는가?",
    choices: ["인플레이션", "스태그플레이션", "디플레이션", "리세션"],
    answer: 2,
    explanation: "디플레이션은 물가 수준이 지속적으로 하락하는 현상입니다. 소비 심리를 위축시켜 경기 침체로 이어질 수 있습니다."
  },

  // 사회·경제 — hard
  {
    id: 33,
    category: "일반상식",
    subtopic: "사회·경제",
    difficulty: "hard",
    question: "중앙은행이 시중 은행에 자금을 빌려줄 때 적용하는 금리를 무엇이라 하는가?",
    choices: ["콜금리", "기준금리", "LIBOR", "예금금리"],
    answer: 1,
    explanation: "기준금리(base rate)는 중앙은행이 시중 은행에 자금을 공급하거나 회수할 때 기준이 되는 금리로, 시중 금리 전반에 영향을 미칩니다."
  },

  // 문화·예술 — easy
  {
    id: 34,
    category: "일반상식",
    subtopic: "문화·예술",
    difficulty: "easy",
    question: "연간 관람객 수 기준 세계 최다 방문 미술관 중 하나로, 프랑스 파리에 위치한 곳은?",
    choices: ["대영박물관", "루브르 박물관", "우피치 미술관", "메트로폴리탄 미술관"],
    answer: 1,
    explanation: "루브르 박물관은 파리에 위치하며, 연간 약 900만 명(코로나 이전 기준)이 방문하는 세계 최다 관람객 미술관 중 하나입니다. 레오나르도 다빈치의 '모나리자'를 비롯해 약 38만 점의 소장품을 보유하고 있습니다."
  },

  // 문화·예술 — medium
  {
    id: 35,
    category: "일반상식",
    subtopic: "문화·예술",
    difficulty: "medium",
    question: "베토벤의 교향곡 제9번의 별칭은?",
    choices: ["운명", "합창", "전원", "영웅"],
    answer: 1,
    explanation: "베토벤의 교향곡 제9번은 4악장에 실러의 시 '환희의 송가'를 합창으로 삽입하여 '합창'이라는 별칭을 얻었습니다."
  },

  // 스포츠 — easy
  {
    id: 36,
    category: "일반상식",
    subtopic: "스포츠",
    difficulty: "easy",
    question: "올림픽 오륜기의 다섯 고리 색깔에 포함되지 않는 색은?",
    choices: ["파랑", "빨강", "보라", "노랑"],
    answer: 2,
    explanation: "올림픽 오륜기는 파랑·노랑·검정·초록·빨강의 5색 고리로 이루어져 있습니다. 보라는 포함되지 않습니다."
  },

  // 스포츠 — medium
  {
    id: 37,
    category: "일반상식",
    subtopic: "스포츠",
    difficulty: "medium",
    question: "축구에서 경기장 안에 동시에 있을 수 있는 한 팀의 선수 수는?",
    choices: ["9명", "10명", "11명", "12명"],
    answer: 2,
    explanation: "축구는 한 팀이 11명(골키퍼 1명 + 필드 플레이어 10명)으로 구성됩니다. 퇴장 등으로 줄어들 수 있으나 기본은 11명입니다."
  },

  // 시사·과학기술 — easy
  {
    id: 38,
    category: "일반상식",
    subtopic: "시사·과학기술",
    difficulty: "easy",
    question: "인터넷 주소 체계에서 웹 페이지 주소를 나타내는 약자는?",
    choices: ["HTTP", "URL", "IP", "DNS"],
    answer: 1,
    explanation: "URL(Uniform Resource Locator)은 인터넷에서 자원의 위치를 나타내는 주소 체계입니다. 웹 브라우저 주소창에 입력하는 값이 URL입니다."
  },

  // 시사·과학기술 — medium
  {
    id: 39,
    category: "일반상식",
    subtopic: "시사·과학기술",
    difficulty: "medium",
    question: "인공지능(AI)에서 사람의 뇌 신경망 구조를 모방한 학습 방식을 무엇이라 하는가?",
    choices: ["블록체인", "딥러닝", "클라우드 컴퓨팅", "사물인터넷"],
    answer: 1,
    explanation: "딥러닝(Deep Learning)은 인공 신경망을 여러 층으로 쌓아 대량의 데이터에서 스스로 특징을 학습하는 AI 기술입니다."
  },

  // 시사·과학기술 — hard
  {
    id: 40,
    category: "일반상식",
    subtopic: "시사·과학기술",
    difficulty: "hard",
    question: "블록체인 기술에서 새로운 거래 블록을 생성하기 위해 복잡한 수학 문제를 풀어 보상을 받는 과정을 무엇이라 하는가?",
    choices: ["스테이킹(Staking)", "마이닝(Mining)", "에어드롭(Airdrop)", "포킹(Forking)"],
    answer: 1,
    explanation: "마이닝(채굴)은 블록체인 네트워크에서 거래를 검증하고 새 블록을 생성하기 위해 연산 자원을 투입하는 과정으로, 성공 시 암호화폐를 보상으로 받습니다."
  },

  // 문화·예술 — hard
  {
    id: 41,
    category: "일반상식",
    subtopic: "문화·예술",
    difficulty: "hard",
    question: "노벨 문학상을 수상한 최초의 아시아 출신 작가는?",
    choices: ["루쉰", "가와바타 야스나리", "라빈드라나트 타고르", "오에 겐자부로"],
    answer: 2,
    explanation: "인도의 시인·철학자 라빈드라나트 타고르는 1913년 노벨 문학상을 수상하여 아시아 작가 최초의 수상자가 되었습니다. 루쉰은 노벨상을 받지 못했으며, 가와바타 야스나리는 1968년, 오에 겐자부로는 1994년에 각각 수상했습니다."
  }

];
