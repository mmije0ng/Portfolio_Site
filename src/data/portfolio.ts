import type { Profile, Project, SimpleItem, SkillGroup, TimelineItem } from '../types/portfolio'

export const profile: Profile = {
  name: '박미정',
  role: 'Backend Developer · Full Stack Developer  · Cloud Infra Engineer · Mobility Security Researcher',
  birthDate: '2004.01.08',
  phone: '010-5501-0589',
  email: 'arsvita0116@gmail.com',
  education: '한성대학교 컴퓨터공학부(모바일소프트웨어, 웹공학)\n2022.03 - 2026.08 (졸업예정)',
  gpa: '4.1 / 4.5',
  github: 'https://github.com/mmije0ng',
  linkedin: 'https://www.linkedin.com/in/park-mijeong',
  tagline: '트래픽, 인프라, 보안 연구까지\n다양한 분야에 기여하는 백엔드 개발자',
  summary: [
    'IT 연합 동아리에서 1년간 활동하며 Spring Boot 기반 백엔드 개발과 AWS, Docker 기반의 인프라 구축 및 CI/CD 운영을 담당했습니다. RabbitMQ 기반의 메시지 유실 없는 안정적인 아키텍처를 설계한 경험이 있습니다.',
    '특히 대규모 트래픽 처리에 관심을 가져 부하 테스트를 수행했으며, 쿼리 최적화·커넥션 풀 및 스레드 튜닝·Redis 캐시를 단계적으로 적용해 응답 지연 시간을 62% 단축하고 시스템 처리 용량을 2.8배 확장한 경험이 있습니다.',
    '아울러 모빌리티 사이버보안 연구실에서 학부연구생으로 활동하며, SDV 환경의 암호·블록체인 연구 및 현대자동차와의 산학협력프로젝트, LLM/VLM 연계 자율주행 R&D 과제를 수행해 연구 역량을 넓혔습니다.',
    '모든 경험에는 배움이 있다고 생각합니다. 다양한 분야에 기여할 수 있는, 시야가 넓은 개발자를 목표로 하고 있습니다.',
  ],
  quote: 'Done is better than perfect.\n일단 하는 것, 해내는 것 자체가 중요하다.',
}

export const profileKeywords = [
  'Spring Boot 백엔드 개발',
  'AWS·Docker 인프라',
  'CI/CD 운영',
  'RabbitMQ 메시징',
  '대규모 트래픽 처리',
  'Redis 캐시 최적화',
  'SDV·모빌리티 보안 연구',
  'LLM/VLM R&D',
  '웹 / 모바일 풀스택'
]

export const heroStats = [
  { label: 'GPA', value: '4.1 / 4.5' },
  { label: 'Performance', value: '2.8x throughput' },
  { label: 'Response Time', value: '-62%' },
  { label: 'Published', value: '2 papers' },
]

export const experiences: TimelineItem[] = [
  {
    title: '지능 모빌리티 및 사이버보안 연구실 학부연구생',
    period: '2025.01 - 2025.11',
    category: 'Research',
    description: 'IoT 보안 및 모빌리티 사이버보안 연구 수행',
    bullets: [
      'SDV 환경에 적합한 암호 기술 및 블록체인 연구 수행',
      '현대자동차 연구원과 산학협력 프로젝트 수행',
      '한국자동차공학회 사이버보안세션 논문 2편 투고',
      'LLM/VLM 연계 한일 범용 주행모델 개발 R&D 과제 참여',
    ],
    links: [
      { label: 'OTA 플랫폼 프로젝트', href: '/projects/iot-ota-platform' },
      { label: 'CP-ABE 논문', href: '/research/cp-abe-iot-update-security' },
      { label: 'ECU 해시 논문', href: '/research/ecu-hash-performance' },
    ],
  },
  {
    title: '(주)오케이마트 프로젝트형 인턴 백엔드 개발자',
    period: '2025.08.11 - 2025.10.12',
    category: 'Internship',
    description: '사내 쇼핑몰 ERP 시스템 백엔드 개발',
    bullets: [
      '미래내일 일경험 프로젝트형 사업으로 이커머스 기업 백엔드 개발 참여',
      '사내 배포를 완료하고 직원 실사용 단계까지 연결',
      '엑셀 기반 수작업 업무를 자동화 시스템으로 전환해 멀티채널 판매·ERP 연동 지원',
    ],
    link: {
      label: 'ERP 프로젝트',
      href: '/projects/okmart-erp',
    },
  },
  {
    title: '2025 오픈소스 개발자대회',
    period: '2025.02 - 2025.10',
    category: 'Project · Competition',
    description: 'IoT 기기의 안전한 소프트웨어 업데이트를 위한 블록체인 기반 분산형 OTA 업데이트 플랫폼 개발',
    bullets: [
      '블록체인으로 업데이트 기록의 위·변조를 방지하는 구조 설계',
      '스마트 컨트랙트로 업데이트 배포와 결제를 원자적으로 처리',
      'CP-ABE(속성 기반 암호화), ECDSA 서명 등 암호 알고리즘&서명 기반 안전한 시스템',
      '취약점 스캔, 라이선스 충돌 검사, 의존성 충돌 분석으로 오픈소스 공개 품질과 보안성 확보',
    ],
    link: {
      label: 'OTA Platform',
      href: '/projects/iot-ota-platform',
    },
  },
  {
    title: 'UMC 8th Server SpringBoot 시니어코스 (전국 대학생 IT 연합동아리)',
    period: '2025.03.14 - 2025.08.23',
    category: 'Backend Lead',
    description: 'SNS형 소비 관리 웹앱 서비스 돈터치 개발',
    bullets: [
      '백엔드 팀장으로 서비스 개발 참여',
      'DB 유니크 제약과 비관적 락으로 등록 횟수 제한 데이터의 동시성 이슈 해결',
      'Bastion Host 도입으로 Private Subnet 내 RDS 접근 구조와 인프라 보안 강화',
    ],
    link: {
      label: '돈터치',
      href: '/projects/money-touch',
    },
  },
  {
    title: '현대자동차 SW산학협력프로젝트',
    period: '2025.04.07 - 2025.07.20',
    category: 'Research Project',
    description: 'SDV 환경을 위한 음성 인식 기반 OTA 소프트웨어 업데이트 적용 기법 연구',
    bullets: [
      '현대자동차 연구원과 산학협력 프로젝트 수행',
      'LLM, NLU, STT/TTS, MCP, 화자 인식을 융합한 자율주행 음성 명령 구조 연구',
      'OTA 음성 업데이트 및 음성 자율주행 기능을 연동해 주행 중 안전성과 사용자 편의성을 함께 고려',
    ],
    link: {
      label: 'OTA Platform',
      href: '/projects/iot-ota-platform',
    },
  },
  {
    title: '2025 한국자동차공학회 춘계학술대회',
    period: '2025.05.21 - 2025.05.23',
    category: 'Research Paper',
    description: '한국자동차공학회 춘계학술대회 자동차 사이버보안 세션 논문 2편 투고',
    bullets: [
      '속성 만료와 속성 레벨 키 갱신을 활용한 CP-ABE 기반 IoT 소프트웨어 업데이트 보안 연구 투고',
      '자동차 ECU 환경의 소프트웨어 업데이트를 위한 해시 함수 성능 평가 연구 투고 (학부생 부분 우수발표 논문상)',
    ],
    links: [
      { label: 'CP-ABE 논문', href: '/research/cp-abe-iot-update-security' },
      { label: 'ECU 해시 논문', href: '/research/ecu-hash-performance' },
    ],
  },
  {
    title: 'UMC 7th Server SpringBoot (전국 대학생 IT 연합동아리)',
    period: '2024.09.16 - 2025.02.21',
    category: 'Backend Lead',
    description: '농업인과 농업 전문가를 연결하는 매칭 플랫폼 FarmON 개발',
    bullets: [
      'k6 기반 동시 사용자 1,000명 규모 부하 테스트 수행',
      'Prometheus·Grafana로 병목 구간을 모니터링하고 Redis 캐시로 평균 응답 시간 약 62% 개선',
      'RabbitMQ 메시지 브로커를 도입해 채팅 메시지 유실을 방지하는 아키텍처 설계',
    ],
    link: {
      label: 'FarmON',
      href: '/projects/farmon',
    },
  },
  {
    title: '2024 한성SW중심대학 페스티벌 (다우기술 기업연계)',
    period: '2024.09 - 2025.11',
    category: 'Competition',
    description: '생성형 AI기반 광고 이미지 생성 및 문자 발송 서비스 AI 템플릿 메이커 개발',
    bullets: [
      '생성형 AI로 제작한 광고 이미지를 템플릿으로 꾸미고 문자 발송 서비스 뿌리오와 연동',
      'DALL·E-3 기반 비동기 이미지 생성 로직 최적화로 이미지 생성 속도 약 8배 개선',
      '한성SW중심대학 페스티벌 우수상 수상 (2등)'
    ],
    link: {
      label: 'AI Template Maker',
      href: '/projects/ai-template-maker',
    },
  },
  {
    title: '제 20회 한성공학경진대회',
    period: '2024.07 - 2025.09',
    category: 'Competition Lead',
    description: '머신러닝 기반 웹 피싱 탐지 서비스 개발',
    bullets: [
      '팀장으로 참여해 머신러닝 모델 학습 및 피처 엔지니어링 수행',
      '최종 모델 정확도 0.9538 달성 및 피처 엔지니어링으로 탐지 시간 약 62% 단축',
      'Chrome 웹스토어 확장 프로그램 출시 및 웹 사이트 배포, 동상 수상 (3등)',
    ],
    link: {
      label: '웹 피싱 탐지 프로젝트',
      href: '/projects/web-phishing-detection',
    },
  },
  {
    title: '구름톤 유니브 2기 백엔드 (kakao·goorm 주관)',
    period: '2024.02 - 2024.07',
    category: 'Backend',
    description: '대학생을 위한 기부&중고 거래 플랫폼 WEAR 개발',
    bullets: [
      'Redis를 활용한 검색 기능 개발',
      'JWT 기반 사용자 인증·인가 기능 개발',
      '대학 순위 스케줄링 기능 개발 및 kakao·goorm 주관 해커톤 벚꽃톤 참여',
    ],
    link: {
      label: 'WEAR',
      href: '/projects/wear',
    },
  },
]

export const projects: Project[] = [
  {
    title: '블록체인 기반 분산형 OTA 업데이트 플랫폼',
    category: 'Security',
    description: 'IoT 기기의 안전한 소프트웨어 업데이트를 위한 캡스톤디자인·오픈소스 개발자대회 프로젝트',
    impact: '캡스톤디자인 우수상 수상, 오픈소스 공개 품질 및 보안성 확보',
    stack: ['Blockchain', 'Smart Contract', 'IoT Security', 'OTA'],
    link: {
      label: 'Project',
      href: 'https://www.notion.so/1-IoT-2effa90271ee816b875ac5eb681b89a8?pvs=21',
    },
  },
  {
    title: '사내 쇼핑몰 ERP 시스템',
    category: 'Backend',
    description: '오케이마트 내부 업무 자동화를 위한 쇼핑몰 ERP 백엔드',
    impact: '사내 배포 완료 및 직원 실사용, 멀티채널 판매·ERP 연동 지원',
    stack: ['Spring Boot', 'Backend', 'ERP', 'Automation'],
    link: {
      label: 'Project',
      href: 'https://www.notion.so/2-ERP-2effa90271ee8199a81acd7375477b0c?pvs=21',
    },
  },
  {
    title: '돈터치',
    category: 'Backend',
    description: 'SNS형 소비 관리 웹앱 서비스의 백엔드',
    impact: '백엔드 팀장으로 참여, DB 유니크 제약과 비관적 락으로 등록 횟수 제한 데이터의 동시성 이슈 해결',
    stack: ['Spring Boot', 'Database Lock', 'RDS', 'Bastion Host'],
    link: {
      label: 'Project',
      href: 'https://www.notion.so/4-SNS-2effa90271ee81f38e21c47e0c236faa?pvs=21',
    },
  },
  {
    title: 'SDV 음성 인식 기반 OTA 업데이트 연구',
    category: 'Research',
    description: '현대자동차 SW산학협력프로젝트로 수행한 차량 인터페이스 및 OTA 적용 기법 연구',
    impact: 'LLM, NLU, STT/TTS, MCP, 화자 인식을 융합해 자율주행 음성 명령과 OTA 음성 업데이트 기능 연동',
    stack: ['SDV', 'LLM', 'STT/TTS', 'MCP', 'OTA'],
    link: {
      label: 'Research',
      href: 'https://www.notion.so/1-IoT-2effa90271ee816b875ac5eb681b89a8?pvs=21',
    },
  },
  {
    title: 'FarmON',
    category: 'Backend',
    description: '농업인과 농업 전문가를 연결하는 매칭 플랫폼',
    impact: '77만 건 이상 요청 처리, 평균 응답 시간 약 70% 개선, 처리 용량 약 2.8배 확장',
    stack: ['Spring Boot', 'Redis', 'RabbitMQ', 'k6', 'Grafana'],
    link: {
      label: 'Project',
      href: 'https://www.notion.so/3-FarmON-2effa90271ee81e5a6f1ce6d9afc03fa?pvs=21',
    },
  },
  {
    title: 'AI 템플릿 메이커',
    category: 'AI',
    description: '생성형 AI 광고 이미지를 템플릿으로 편집하고 뿌리오 문자 발송으로 연결하는 웹 서비스',
    impact: '한성SW중심대학 페스티벌 우수상, DALL·E-3 이미지 생성 속도 약 5 개선',
    stack: ['DALL·E 3', 'Async Processing', 'External API', 'Web'],
    link: {
      label: 'Project',
      href: 'https://www.notion.so/5-AI-AI-2effa90271ee812e8377ce688ded9009?pvs=21',
    },
  },
  {
    title: '머신러닝 기반 웹 피싱 탐지 서비스',
    category: 'AI',
    description: '웹 피싱 탐지 모델 학습과 Chrome 확장 프로그램·웹 사이트 배포',
    impact: '한성공학경진대회 동상, 정확도 0.9538, 탐지 시간 약 62% 단축',
    stack: ['Machine Learning', 'Feature Engineering', 'Chrome Extension'],
    link: {
      label: 'Web Store',
      href: 'https://chromewebstore.google.com/detail/catch-phishing/lcjnjlhedbbckkcenidmfokbpchnimji?hl=ko&pli=1',
    },
  },
  {
    title: 'WEAR',
    category: 'Backend',
    description: '대학생을 위한 기부&중고 거래 플랫폼',
    impact: 'Redis 검색, JWT 기반 사용자 인증·인가, 대학 순위 스케줄링 기능 개발',
    stack: ['Spring Boot', 'Redis', 'JWT', 'Scheduler'],
    link: {
      label: 'Project',
      href: 'https://www.notion.so/8-WEAR-2effa90271ee814abcc1d5b288e80b74?pvs=21',
    },
  },
]

export const papers: Project[] = [
  {
    slug: 'cp-abe-iot-update-security',
    title: 'CP-ABE 기반 IoT 소프트웨어 업데이트의 보안성 강화 연구',
    category: 'Security',
    type: '2025 한국자동차공학회 춘계학술대회 사이버보안 세션',
    period: '2025.05.21 - 2025.05.23',
    role: '논문 작성 및 보안 구조 연구',
    description: '속성 만료와 속성 레벨 키 갱신을 활용한 업데이트 보안 강화 연구',
    impact: '2025 한국자동차공학회 춘계학술대회 사이버보안 세션 투고',
    stack: ['CP-ABE', 'Dynamic CP-ABE', 'IoT Security', 'Software Update', 'Python'],
    overview: [
      'IoT 소프트웨어 업데이트 과정에서 업데이트 파일의 접근 권한을 속성 기반으로 제어하는 보안 구조를 다뤘습니다.',
      '속성 만료와 속성 레벨 키 갱신을 활용해 권한 변경 상황에서도 업데이트 접근 제어가 유지되는 방향을 정리했습니다.',
    ],
    contributions: [
      'CP-ABE 기반 업데이트 파일 접근 제어 구조 정리',
      '속성 만료 및 키 갱신 시나리오를 소프트웨어 업데이트 흐름에 맞춰 분석',
      'IoT 업데이트 보안 위협과 대응 흐름을 논문 형식으로 정리',
    ],
    problemSolving: [
      {
        title: '권한 변경 이후 업데이트 접근 제어',
        problem: '기존 접근 권한이 변경된 이후에도 과거 키를 통한 업데이트 접근 가능성이 남을 수 있습니다.',
        solution: '속성 만료와 속성 레벨 키 갱신을 적용해 권한 변경 시점 이후의 접근 제어 흐름을 분리했습니다.',
        result: 'IoT 소프트웨어 업데이트 환경에서 더 세밀한 권한 제어 방식을 제안했습니다.',
      },
    ],
    link: {
      label: '논문 정보',
      href: 'https://www.ksae.org/journal_list/search_index.php?mode=view&sid=57152',
    },
  },
  {
    slug: 'ecu-hash-performance',
    title: '자동차 ECU 환경의 해시 함수 성능 평가 연구',
    category: 'Automotive',
    type: '2025 한국자동차공학회 춘계학술대회 사이버보안 세션',
    period: '2025.05.21 - 2025.05.23',
    role: '성능 평가 및 논문 작성',
    description: '자동차 ECU 환경에서 소프트웨어 업데이트를 위한 해시 함수 성능 평가',
    impact: '2025 한국자동차공학회 춘계학술대회 우수 발표 논문상',
    stack: ['BLAKE3', 'SHA-256', 'ECU', 'Hash Function', 'Automotive Security', 'C'],
    overview: [
      '자동차 ECU 환경에서 소프트웨어 업데이트 무결성 검증에 사용할 해시 함수의 성능을 비교했습니다.',
      '제한된 차량 임베디드 환경을 고려해 해시 함수별 처리 특성과 적용 가능성을 정리했습니다.',
    ],
    contributions: [
      'ECU 소프트웨어 업데이트 환경의 해시 함수 적용 시나리오 정리',
      '해시 함수 성능 평가 기준과 비교 흐름 설계',
      '성능 평가 결과를 기반으로 우수 발표 논문상 수상 논문 작성',
    ],
    problemSolving: [
      {
        title: '제한된 ECU 환경에서의 무결성 검증 비용',
        problem: '차량 ECU 환경에서는 업데이트 무결성 검증 과정의 연산 비용이 실제 적용 가능성에 영향을 줍니다.',
        solution: '소프트웨어 업데이트 관점에서 해시 함수별 성능 비교 기준을 정리하고 평가했습니다.',
        result: '차량 ECU 환경에 적합한 해시 함수 선택 기준을 연구 결과로 정리했습니다.',
      },
    ],
    link: {
      label: '논문 정보',
      href: 'https://www.ksae.org/journal_list/search_index.php?mode=view&sid=57151',
    },
  },
]

export const skillGroups: SkillGroup[] = [
  {
    title: 'Language & Framework',
    items: [
      'JAVA',
      'SpringBoot',
      'Python',
      'Flask',
      'FastAPI',
      'JavaScript',
      'TypeScript',
      'React',
      'React Native',
      'C',
      'C++',
      'Node.js',
      'Django',
      'Kotlin',
      'Swift',
      'Flutter',
      'Solidity',
    ],
  },
  {
    title: 'Database & Query',
    items: [
      'Redis',
      'MySQL',
      'MariaDB',
      'Oracle',
      'Firebase',
      'PostgreSQL',
      'QueryDSL',
      'Optimistic Lock',
      'Pessimistic Lock'
    ],
  },
  {
    title: 'Infrastructure & DevOps',
    items: [
      'k6',
      'Prometheus',
      'Grafana',
      'RabbitMQ',
      'Docker',
      'AWS',
      'EC2',
      'RDS',
      'ACM',
      'Route53',
      'ALB',
      'CloudFront',
      'S3',
      'Nginx',
      'GitHub Actions',
    ],
  },
  {
    title: 'Security, Blockchain & AI',
    items: [
      'Blockchain',
      'Web3',
      'Smart Contract',
      'ECDSA',
      'CP-ABE',
      'AES-256',
      'SHA3-256',
      'BLAKE3',
      'XGBoost',
      'SVM',
      'MLP',
      'Random Forest',
      'NumPy • Pandas'
    ],
  },
]

export const awards: SimpleItem[] = [
  { title: '2025 한국자동차공학회 춘계학술대회 우수발표 논문상', meta: '한국자동차공학회 · 2025.06.24' },
  { title: '2025 한성대학교 컴퓨터공학부 캡스톤디자인 우수상 (2등)', meta: '한성대학교 컴퓨터공학부 · 2025.05.30' },
  { title: '2024 한성 SW중심대학 페스티벌 프리캡스톤 전시회 우수상 (2등)', meta: '한성대학교 SW중심대학사업단 · 2024.11.29' },
  { title: '제20회 한성공학경진대회 동상 (3등)', meta: '한성대학교 · 2024.09.26' },
  { title: '성적 우수 장학금 3회 수상', meta: '한성대학교 · 2022.09 - 2024.03' },
]

export const certifications: SimpleItem[] = [
  { title: '정보처리기사', meta: '한국산업인력공단 · 2025.12.25' },
  { title: 'AWS Certified Solutions Architect - Associate', meta: 'AWS · 2026.03.21' },
  { title: 'SQLD', meta: '한국데이터산업진흥원 · 2026.03.27' },
  { title: 'TOPCIT(소프트웨어 역량 검정) LEVEL3 (617)', meta: '정보통신기획평가원 · 2025.11.01' },
  { title: 'Google Analytics Certification', meta: 'Google · 2026.02.05' },
  { title: 'TOEIC Speaking IH (140)', meta: 'YBM · 2026.03.08' },
]

export const programs: SimpleItem[] = [
  {
    title: '미래내일 일경험 프로젝트형',
    meta: '(주)오케이마트 · AI 기반 커머스 자동화 혁신 프로젝트 · 2025.08.11 - 2025.10.03',
  },
  {
    title: '인공지능 모델 활용을 위한 웹 프로그래밍',
    meta: '구름 K-디지털 기초역량훈련 · 41시간 · 2024.05.14 - 2024.07.05',
  },
]

export const links = [
  { label: 'GitHub', href: 'https://github.com/mmije0ng' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/park-mijeong/' },
  { label: 'CV', href: 'https://mmije0ng.notion.site/cv' },
  { label: 'Blog', href: 'https://mmije0ng.tistory.com/' },
]

export const workPrinciples = [
  {
    title: '기술은 목적에 맞게 선택합니다',
    description: '새로운 기술 자도 중요하지만, 이 기술이 지금 문제를 해결하는 데 왜 필요한지를 먼저 검토합니다.',
  },
  {
    title: '설계 단계에서 예외 상황까지 봅니다',
    description: '정상 흐름만 구현하지 않고 예외 처리, 실패 시나리오, 운영 중 발생할 문제까지 함께 고려하며 설계합니다.',
  },
  {
    title: '작업 상황을 자주 공유합니다',
    description: '진행 상황과 이슈를 빠르게 공유해 팀이 같은 맥락을 유지하도록 하고, 협업 비용을 줄이는 방식을 선호합니다.',
  },
  {
    title: '함께 성장하는 팀을 중요하게 생각합니다',
    description: '혼자 잘하는 것보다 팀원 모두가 이해하고 함께 성장하는 경험이 더 오래가는 성과를 만든다고 믿습니다.',
  },
  {
    title: '넓은 시야로 개발을 바라봅니다',
    description: '같은 개발이라도 기능 구현에만 머무르지 않고 사용자 경험, 운영 환경, 유지보수까지 함께 보는 시야를 중요하게 생각합니다.',
  },
  {
    title: '즐겁고 건강한 협업 환경을 지향합니다',
    description: '솔직하고 존중 있는 커뮤니케이션이 좋은 결과를 만든다고 믿으며, 일하기 좋은 팀 분위기를 중요하게 생각합니다.',
  },
] as const
