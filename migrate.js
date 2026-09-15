const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'sobeelab-creer';
const DATABASE_ID = process.env.FIREBASE_DATABASE_ID || 'job-board';
const API_KEY = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const ACCESS_TOKEN = process.env.FIREBASE_ACCESS_TOKEN;
const SNAPSHOT_DATE = '2026-09-15';
const PORTFOLIO = {
  version: 'Portfolio_v6.pdf',
  total_pages: 24,
  index: '경력 3-6 / mmuni 7-12 / psycho.pizza 13-17 / AI·LLM 18-22 / 성장 23 / 협업 24',
};

if (!API_KEY) throw new Error('FIREBASE_API_KEY 또는 NEXT_PUBLIC_FIREBASE_API_KEY가 필요합니다.');

const companyMeta = {
  'nhn-payco': ['NHN PAYCO', '중견기업', '핀테크/결제', ['java', 'spring', 'rdbms']],
  'kakao-mobility': ['카카오모빌리티', '대기업', '모빌리티 플랫폼', ['java', 'kotlin', 'spring', 'redis', 'kafka']],
  'hyundai-autoever': ['현대오토에버', '대기업', '로봇/스마트팩토리', ['java', 'spring', 'kafka', 'cloud']],
  'kb-savings': ['KB저축은행', '중견기업', '금융/뱅킹', ['java', 'spring', 'oracle', 'rdbms']],
  'hyundai-git': ['현대IT&E / GIT', '대기업 계열', '엔터프라이즈 IT', ['java', 'spring', 'rdbms', 'cloud']],
  'infobank': ['인포뱅크', '중견기업', '플랫폼/메시징', ['java', 'spring', 'kotlin', 'aws']],
  'starship': ['스타쉽엔터테인먼트', '중견기업', '엔터테인먼트 IT', ['java', 'spring', 'aws']],
  'supercent': ['슈퍼센트', '스타트업', '모바일/AD-Tech', ['java', 'kotlin', 'spring', 'kafka', 'aws']],
  'hybe': ['HYBE', '대기업', '엔터테인먼트 플랫폼', ['java', 'spring', 'python', 'ai', 'aws']],
  'sk-shielders': ['SK쉴더스', '대기업 계열', '보안/클라우드', ['java', 'spring', 'aws', 'iot']],
  'kbds-insurance': ['KB데이타시스템 보험부문', '대기업 계열', '금융 IT', ['java', 'spring', 'oracle', 'rdbms']],
  'mobigen': ['모비젠', '중소기업', '빅데이터 플랫폼', ['java', 'spring', 'kafka', 'bigdata']],
  'mqnic': ['엠큐닉', '중소기업', '플랫폼/솔루션', ['java', 'spring', 'rdbms']],
  'megastudy': ['메가스터디교육', '중견기업', '교육 플랫폼/ERP', ['java', 'spring', 'rdbms']],
  'hanwha': ['한화시스템', '대기업', '엔터프라이즈 IT', ['java', 'spring', 'cloud']],
  'hansung': ['한성컴퓨터', '중소기업', 'Power Platform/업무자동화', ['power-platform', 'ai', 'microsoft-365']],
  'samsung-sds': ['삼성SDS', '대기업', '클라우드/엔터프라이즈', ['java', 'spring', 'cloud']],
  'kbds-infra': ['KB데이타시스템 인프라부문', '대기업 계열', '인프라/금융 IT', ['java', 'spring', 'aws', 'linux']],
  'blue-garage': ['Blue Garage / JYP', '대기업 계열', '팬 플랫폼/커머스', ['java', 'spring', 'kotlin', 'aws']],
  'lx-pantos': ['LX판토스', '대기업 계열', '물류/글로벌 IT', ['java', 'spring', 'erp', 'cloud']],
  'sk-hynix': ['SK하이닉스', '대기업', '반도체/제조 IT', ['java', 'spring', 'amhs', 'manufacturing']],
  'panopticon': ['Panopticon', '스타트업', 'B2B SaaS', ['java', 'spring', 'kotlin', 'postgresql']],
  'carevia': ['CareVia', '스타트업', '헬스케어 플랫폼', ['java', 'spring', 'vue', 'mobile']],
  'soop': ['SOOP', '대기업', 'AI/추천', ['python', 'ai', 'tensorflow', 'pytorch']],
};

const makeJob = (job_id, company_id, title, range, tech, description, requirements, preferred, deadline_date, manual_status, is_active, fit_level, verdict, source_url, pages, strengths, gaps, improvements, extra = {}) => ({
  job_id, company_id, title, min_experience: range[0], max_experience: range[1], required_tech_stack_ids: tech,
  has_coding_test: extra.has_coding_test || false, has_assignment: extra.has_assignment || false,
  description, requirements, preferred_qualifications: preferred, deadline_date, manual_status, is_active,
  fit_level, verdict, source_url, snapshot_date: SNAPSHOT_DATE,
  portfolio_version: PORTFOLIO.version, portfolio_total_pages: PORTFOLIO.total_pages, portfolio_index: PORTFOLIO.index,
  portfolio_recommended_pages: pages, portfolio_strengths: strengths, portfolio_gaps: gaps, portfolio_improvements: improvements,
});

const jobs = [
  makeJob('nhn-payco-backend', 'nhn-payco', 'Java 서버 개발', [3, 99], ['java', 'spring', 'rdbms'], '결제·정산·FDS·포인트 등 금융성 도메인의 백엔드 API와 정합성 흐름을 개발합니다.', 'Java/Spring, RDBMS, 트랜잭션과 예외 흐름을 설명할 수 있는 역량.', '핀테크·결제·대규모 트래픽, 테스트·모니터링 경험.', '2026-11-09', 'VERIFY', true, 'S', '최우선', 'https://payco.com/recruit', 'p3-6, p7, p9', '업무 규칙·정합성·SQL 성능 개선', '결제 멱등성·정산 대사·금융 장애 대응 근거', 'p5의 실행계획에 데이터 규모·쿼리 수·재현 절차를 추가하고, 실제 결제/정산 사례가 있으면 별도 보강'),
  makeJob('kakao-mobility-navi', 'kakao-mobility', '백엔드 개발자(내비 서비스)', [3, 99], ['java', 'kotlin', 'spring', 'redis', 'kafka'], '카카오내비 백엔드 서버·API를 개발·운영하고 성능과 기능을 개선합니다.', 'Java/Kotlin Spring, REST API, RDBMS·NoSQL, Docker·Kubernetes·클라우드.', 'GIS·위치 데이터, Redis/Kafka, 대규모 트래픽 운영.', null, 'OPEN', true, 'S', '최우선', 'https://careerly.co.kr/job/17576075', 'p5-6, p11-12, p20-22', '성능 병목 분석, 책임 경계, 이벤트 흐름', 'GIS·QPS·p95/p99·NoSQL/K8s 운영 지표', 'p5에 QPS·p95/p99·데이터량을 추가하고 p12/22의 Kafka는 현재 구현과 확장 계획을 분리 표기'),
  makeJob('hyundai-autoever-robot', 'hyundai-autoever', 'Robot/Smart Factory Backend', [3, 99], ['java', 'spring', 'kafka', 'cloud'], '로봇·설비·스마트팩토리 시스템을 연결하는 백엔드와 통합 플랫폼을 개발합니다.', 'Java/Kotlin 기반 백엔드, 시스템 연동과 운영 안정성.', '제조·IoT·로봇 프로토콜, 이벤트 기반 아키텍처, 클라우드.', '2026-09-28', 'VERIFY', true, 'A+', '최우선', 'https://m.jobkorea.co.kr/Recruit/GI_Read/49720455?TS_XML=2', 'p6, p11-12, p15-17, p20-22', '의존성·이벤트·배포 호환성 설계', '제조 설비·IoT·로봇 연동 실적', 'p12·17·22에 실제 구현/계획을 구분하고 설비 이벤트·재처리·장애 격리 사례가 있으면 추가'),
  makeJob('kb-savings-it', 'kb-savings', 'IT개발 경력직', [2, 99], ['java', 'spring', 'oracle', 'rdbms'], '금융 서비스의 업무 시스템과 고객 접점 API를 개발·운영합니다.', 'Java/Spring, 관계형 DB, 금융 업무 트랜잭션과 정합성 이해.', '금융권·배치·보안·감사로그·장애 대응.', null, 'VERIFY', true, 'A', '우선지원', 'https://www.kbsavings.com/', 'p3-6, p7, p9', '규칙 구조화·검증 흐름·SQL 성능', '금융 보안·감사·정산 사례', 'p3-6의 트랜잭션 경계와 p7의 운영 전후 지표를 보강하고 실제 금융 연계 경험을 추가'),
  makeJob('hyundai-git-server', 'hyundai-git', 'SW개발1팀 서버개발', [3, 99], ['java', 'spring', 'rdbms', 'cloud'], '현대차그룹 업무 시스템과 엔터프라이즈 서버 서비스를 개발·운영합니다.', 'Java/Spring 기반 업무 시스템과 DB 경험.', '대기업 프로젝트·통합·배포·운영·협업.', '2026-09-23', 'VERIFY', true, 'A', '우선지원', 'https://www.hyundai-autoever.com/kor/careers/recruit.hd', 'p1-6, p7', '업무 도메인·레거시 책임 분리·성능 개선', '협업 인원·릴리즈 책임·운영 규모', 'p1-2에 담당 범위와 협업 규모를 추가하고 p7에 운영 전후 지표를 명시'),
  makeJob('infobank-java', 'infobank', 'Backend Engineer(JAVA)', [3, 99], ['java', 'spring', 'kotlin', 'aws'], 'Membership/Product Platform의 API와 회원·상품 핵심 도메인을 개발합니다.', 'Java, Spring Boot REST API, MySQL, 객체지향·인증/인가·SQL·데이터 모델링.', 'AWS, Redis/RabbitMQ/Kafka, SaaS/B2B, Docker/K8s.', '2026-10-06', 'VERIFY', true, 'A+', '우선지원', 'https://www.jobkorea.co.kr/Recruit/GI_Read/49927562?Oem_Code=C1', 'p3-6, p7, p9, p15-17', 'Spring 경계·도메인 모델·멀티테넌시·배포 호환성', 'AWS 운영과 플랫폼 트래픽 근거', 'p15-17에 사용자 수·권한 케이스·배포 환경을 추가하고 AWS 사용 범위를 명확히 표기', { has_coding_test: true, has_assignment: true }),
  makeJob('starship-fullstack', 'starship', 'Full-stack Developer', [3, 99], ['java', 'spring', 'aws'], '사내 웹서비스·그룹웨어·API 연동과 AWS·CI/CD·IAM 운영을 담당합니다.', 'Java/Spring, API·RDBMS, 서비스 운영.', 'AWS·IAM·CI/CD·장애 대응.', '2026-10-23T23:59:00+09:00', 'VERIFY', true, 'A', '지원', 'https://www.starship-ent.com/', 'p13-17, p23-24', '권한·초대 생명주기·협업과 공유', '팬 서비스·AWS·CI/CD 운영 근거', 'p15-17에 배포 링크·AWS/IAM·CI/CD와 실제 제품 기여를 추가'),
  makeJob('supercent-adtech', 'supercent', 'AD-Tech Backend', [4, 7], ['java', 'kotlin', 'spring', 'kafka', 'aws'], 'Programmatic Ad bidder, bid request와 광고 이벤트 파이프라인을 개발합니다.', 'Java·분산시스템, 성능·부하테스트·비동기 처리.', '광고 입찰·이벤트 스트리밍·Kafka·AWS.', null, 'VERIFY', true, 'A-', '상향지원', 'https://supercent.career.greetinghr.com/ko/position', 'p5, p11-12, p20-22', 'SQL 병목·이벤트·Queue/Worker·실패 경계', '광고 입찰·저지연 처리 지표·연차 필터', 'p5의 latency/throughput을 보강하고 p11-12·22의 실제 적용 범위와 광고 이벤트 전이를 명시'),
  makeJob('hybe-fullstack', 'hybe', 'Full-Stack / Data Platform', [5, 99], ['java', 'spring', 'python', 'ai', 'aws'], '전사 데이터 플랫폼과 사내 시스템의 Backend/API·Batch·Data Model·Cloud를 개발합니다.', 'Java/Spring Backend와 데이터·AI 서비스 이해.', 'BigQuery/Data Warehouse, Frontend, Cloud, LLM/RAG.', null, 'VERIFY', true, 'A-', '상향지원', 'https://careers.hybecorp.com/ko/career', 'p13-18, p19-22, p23', 'AI 요구사항·실행·검증 워크플로와 LLM 성능 측정', '5년 필터·BigQuery·글로벌 운영', 'p18-22에 모델·데이터·실패율·검증 테스트를 추가하고 AI 도구 사용과 AI 제품 개발을 구분'),
  makeJob('sk-shielders-backend', 'sk-shielders', 'AWS/Spring Boot Backend', [5, 99], ['java', 'spring', 'aws', 'iot'], 'AWS·Spring Boot 기반 보안·IoT·클라우드 서비스의 Backend를 개발·운영합니다.', 'Spring Boot, PostgreSQL, AWS, 운영 안정성과 보안 이해.', 'AWS IoT Core·SAP·CloudWatch·보안 이벤트.', '2026-09-20T23:59:00+09:00', 'VERIFY', true, 'A', '상향지원', 'https://www.bzpp.co.kr/biz/businessDetailView/BR250619A00299', 'p5-6, p17, p20-22', '성능·의존성·실패 경계·운영 관점', '5년 필터·AWS 관측성·IoT/SAP', 'p20-22에 로그·메트릭·알림을 추가하고 보안 이벤트·민감정보 처리 사례를 별도 구성'),
  makeJob('kbds-insurance', 'kbds-insurance', '장기보험 청약 시스템 개발·운영', [3, 99], ['java', 'spring', 'oracle', 'rdbms'], 'KB손해보험 장기보험 청약 시스템의 핵심 도메인과 연계 기능을 개발·운영합니다.', 'Java/Spring과 RDBMS 기반 업무 시스템.', '보험 상태 전이·대외계 연계·금융 운영.', null, 'VERIFY', true, 'A', '조건부', 'https://kbds.career.greetinghr.com/ko/openposition', 'p3-6, p7, p9, p15-17', '규칙·상태·권한·호환성 설계', '보험 상품·계약 생명주기', 'p3-6을 계약/청약 상태 전이 예시로 연결하고 금융 연계·배치·계약직 전환 조건을 보강'),
  makeJob('mobigen-platform', 'mobigen', '플랫폼 Backend', [4, 8], ['java', 'spring', 'kafka', 'bigdata'], '데이터 수집·처리·분석 플랫폼의 백엔드와 분산 이벤트 흐름을 개발합니다.', 'Java/Spring, 플랫폼·데이터 처리.', 'Kafka·빅데이터·분산 시스템.', '2026-09-24', 'VERIFY', true, 'A-', '지원', 'https://www.jobplanet.co.kr/companies/77178/reviews/%EB%AA%A8%EB%B9%84%EC%A0%A0', 'p3-6, p7, p11-12', '데이터 정합성·SQL 튜닝·이벤트 모델', '4년 필터·분산 처리 규모', 'p7에 데이터량·실행계획을 추가하고 p11-12에 재처리·순서·중복 방지 전략을 명시'),
  makeJob('mobigen-web', 'mobigen', 'Java/Spring 웹개발', [0, 99], ['java', 'spring', 'rdbms'], 'Java/JSP/JavaScript/Spring/MySQL·Oracle 기반 웹 서비스를 개발합니다.', 'Java/Spring·RDBMS 웹개발.', '제품개발·클라우드·고객 프로젝트.', null, 'VERIFY', true, 'A', '선택', 'https://www.jobplanet.co.kr/job/search?posting_ids%5B%5D=1550038', 'p3-6, p7, p15-17', '업무 시스템 모델링·성능·멀티테넌시', 'SI/SM·레거시·고객 프로젝트 비중', 'p15-17에 고객·배포·장애 대응 범위를 추가하고 구현과 설계 제안을 구분'),
  makeJob('soop-ai-recommendation', 'soop', 'AI 기반 개인화 추천 시스템 엔지니어', [3, 5], ['python', 'ai', 'tensorflow', 'pytorch'], 'VOD·LIVE·Search 행동 기반 추천 및 MLOps/AI Infra 포지션입니다.', '추천 모델과 서비스 적용 경험.', 'Python·TensorFlow/PyTorch·추천 운영.', '2026-09-27T23:59:00+09:00', 'CLOSED', false, 'C', '채용 완료로 제외', 'https://recruit.sooplive.com/recruit_list.php', 'p18-22', 'LLM 워크플로·로컬 추론 성능 측정', '추천 모델·TensorFlow/PyTorch 실무', '재오픈 시 p21의 성능 수치를 추천 품질 지표와 분리하고 모델 평가 사례를 추가'),
  makeJob('mqnic-java-backend', 'mqnic', 'Java/Spring Backend', [5, 99], ['java', 'spring', 'rdbms'], '플랫폼·솔루션 제품의 핵심 백엔드를 주도적으로 개발합니다.', 'Java/Spring 경력 5년 이상과 시스템 설계.', '기술 리딩·성능·장애 대응.', '2026-11-08', 'VERIFY', true, 'B+', '후순위', 'https://www.jobkorea.co.kr/', 'p3-6, p7, p9', '설계 판단·성능 개선', '5년 이상 최소 연차·리딩 규모', 'p1에 본인 소유권·리딩 범위·정량 성과를 전면 배치'),
  makeJob('megastudy-it', 'megastudy', 'IT 개발자', [1, 5], ['java', 'spring', 'rdbms'], '교육 서비스와 ERP/EIS·사내 업무자동화 시스템을 개발·운영합니다.', 'Java/Spring·RDBMS, 신입·경력 1년 이상.', 'ERP·AI 자동화·Azure·Frontend/Infra.', '2026-11-02', 'OPEN', true, 'B', '후순위', 'https://www.jobkorea.co.kr/Recruit/GI_Read/49913814?Oem_Code=C1', 'p3-6, p18, p23', '업무 규칙·성능·AI 업무 분해', '교육/ERP·Azure·내부 IT', 'p3-6을 ERP 흐름과 연결하고 p18에 자동화 결과물·검증 로그를 추가'),
  makeJob('hanwha-it-new-grad', 'hanwha', '플랫폼/IT 신입공채', [0, 1], ['java', 'spring', 'cloud'], '한화 금융그룹의 플랫폼·IT 신입 정규직 채용입니다.', '신입 지원 자격·전공·프로젝트 경험.', 'Java/Spring·클라우드·협업.', '2026-09-18T15:00:00+09:00', 'VERIFY', true, 'B', '별도 카드', 'https://www.saramin.co.kr/zf_user/help/live/view?idx=109953', 'p1-6, p23-24', '실무 도메인과 성장·협업 경험', '신입 전형·경력 인정 여부', 'p1-2에 경력직이 아닌 신입으로 지원하는 이유를 보강하고 경력 3년 7개월을 명확히 표기'),
  makeJob('hansung-power-platform', 'hansung', 'Power Platform·AI 업무자동화', [1, 99], ['power-platform', 'ai', 'microsoft-365'], 'Copilot Studio, Power Apps/Dataverse, API/MCP 기반 업무자동화를 수행합니다.', '업무 분석·자동화·데이터 연계.', 'Power Apps·Power Automate·M365·AI.', null, 'VERIFY', true, 'B', '조건부', 'https://www.jobkorea.co.kr/', 'p18, p20-22, p23', 'AI 작업 분해·검증·비동기 워커', 'Power Platform/M365 사용 경험', 'p18을 실제 Power Platform 자동화 사례로 재구성할 근거가 있을 때만 지원'),
  makeJob('samsung-sds-3rd', 'samsung-sds', '2026 하반기 3급 Software 신입', [0, 1], ['java', 'spring', 'cloud'], '삼성SDS의 AI·Cloud·Solution·Logistics 관련 신입 Software 채용입니다.', '신입·학력·영어 등 공통 요건 확인 필요.', 'Java/Spring·클라우드·프로젝트.', '2026-09-15T17:00:00+09:00', 'CLOSE_TODAY', true, 'B', '오늘 마감·패스', 'https://www.samsungcareers.com/subsid/detail/C60?lang=en', 'p1-2, p23', '실무 프로젝트·성장 방향', '신입·영어·학력 요건', '지원 전 자격요건을 확인하고 제출한다면 p1-2 중심으로 압축'),
  makeJob('kbds-infra-admin', 'kbds-infra', 'Infra Admin', [3, 99], ['java', 'spring', 'aws', 'linux'], '금융 서비스의 서버·스토리지·백업·WAS와 장애 대응을 운영합니다.', 'Linux/Unix/Windows, WAS, SAN/NAS·백업 중 하나 이상.', 'AWS·모니터링·보안·금융 인프라.', null, 'VERIFY', true, 'C', '패스', 'https://careerly.co.kr/job/16501836', 'p5-6, p20-22', '운영·장애 경계·성능 분석 일부', '인프라 운영 깊이·Backend 방향', '지원 시 p20-22에 Linux/AWS·관측성 증거를 추가하되 Backend 목표와 분리 판단'),
  makeJob('blue-garage-fans', 'blue-garage', 'FANS Backend', [3, 99], ['java', 'spring', 'kotlin', 'aws'], '팬 커뮤니티·콘텐츠·커머스를 지원하는 FANS 플랫폼 백엔드를 개발합니다.', 'Java/Kotlin/Spring 서비스와 API.', '실시간·커머스·AWS·글로벌 서비스.', null, 'VERIFY', true, 'A-', '재확인 후 도전', 'https://recruit-apply.jype.com/o/214587', 'p7-12, p15-17, p24', '실시간 채팅·이벤트·권한·협업', '팬/커머스 실서비스·트래픽 규모', 'p7-12에 실제 구현 범위·동시 사용자·메시지 처리량과 배포 증거를 추가'),
  makeJob('lx-pantos-eu-it', 'lx-pantos', '유럽지역 물류 IT 전문가', [3, 99], ['java', 'spring', 'erp', 'cloud'], '독일 현지 법인의 물류·ERP·업무 시스템을 운영하고 글로벌 IT 개선을 수행합니다.', '업무 시스템 개발·운영과 글로벌 커뮤니케이션.', 'ERP·물류·영어/독일어·해외 운영.', null, 'VERIFY', true, 'A-', '별도 검토', 'https://www.saramin.co.kr/zf_user/jobs/relay/pop-view?rec_idx=54753620', 'p3-6, p7, p9, p15-17, p23', '규칙·정합성·배포 호환성·문서화', 'ERP·물류·언어·해외 운영', 'p1-2에 협업·문서화와 p15-17의 권한 설계를 글로벌 법인 운영 관점으로 연결'),
  makeJob('sk-hynix-talent-hy-way', 'sk-hynix', 'IT/AMHS Talent hy-way', [3, 99], ['java', 'spring', 'amhs', 'manufacturing'], '반도체 제조·AMHS·생산 시스템의 IT 인재풀입니다.', '제조·생산 IT 또는 업무 시스템 개발·운영.', 'AMHS·MES·설비 연동·데이터 처리.', null, 'TALENT_POOL', true, 'B+', '별도 검토', 'https://app.superpasshr.com/positions/326aeed5-b2a4-4e08-9317-28bc25a5c708', 'p3-6, p7, p9, p12, p17', '복잡한 규칙·데이터 정합성·호환성', '반도체·AMHS·현장 설비', 'p3-6을 제조 상태 전이로 연결하고 p12/17에 운영·장애 복구 기준을 구체화'),
  makeJob('panopticon-backend', 'panopticon', 'Backend/서비스 기획·설계', [3, 99], ['java', 'spring', 'kotlin', 'postgresql'], 'B2B SaaS 고객 문제를 도메인 모델과 백엔드 기능으로 해결합니다.', 'Java/Kotlin/Spring과 제품 개발 전 과정.', '요구사항 구조화·PostgreSQL·고객 피드백.', null, 'VERIFY', true, 'B+', '재검색 필요', 'https://www.jobkorea.co.kr/', 'p1-6, p7, p9, p13-14', '요구사항·규칙·상태·책임 경계', '정확한 직무 범위와 공고 원문', 'p1-6과 p13-14에 문제 발견→결정→사용자 결과를 한 줄씩 보강'),
  makeJob('carevia-fullstack', 'carevia', '풀스택 개발자·제품 개발 오너', [2, 5], ['java', 'spring', 'vue', 'mobile'], '돌봄·헬스케어 서비스의 화면·API와 웹→모바일 전환을 함께 개선합니다.', '웹 서비스 개발과 제품 문제를 직접 해결하는 실행력.', 'Vue3/Pinia·모바일·WebSocket·Docker/CI/CD.', null, 'VERIFY', true, 'B+', '조건부', 'https://www.carevia.co.kr/', 'p1, p3-6, p13-17, p18', 'Spring/Java·제품 흐름·권한·AI 활용', 'Vue·모바일·헬스케어 개인정보', 'p1에 제품 사용자와 본인 기여를 명시하고 p13-17에 개인정보·권한·감사 흐름을 보강'),
];

function firestoreValue(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value === null) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, firestoreValue(nested)])) } };
}

function firestoreDocument(data) {
  return { fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, firestoreValue(value)])) };
}

const baseUrl = (collection) => `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/${collection}`;
async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (ACCESS_TOKEN) headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}key=${API_KEY}`, { ...options, headers });
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${response.status}: ${(await response.text()).slice(0, 500)}`);
  return response.status === 204 ? null : response.json();
}
async function clearCollection(collection) {
  const result = await request(`${baseUrl(collection)}?pageSize=1000`);
  const documents = result.documents || [];
  for (const document of documents) await request(`https://firestore.googleapis.com/v1/${document.name}`, { method: 'DELETE' });
  console.log(`Cleared ${collection}: ${documents.length}`);
}
async function upsert(collection, id, data) {
  await request(`${baseUrl(collection)}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(firestoreDocument(data)) });
}

async function run() {
  await clearCollection('JOB_POSTINGS');
  await clearCollection('COMPANIES');
  for (const [company_id, [name, company_type, domain, core_tech_stack_ids]] of Object.entries(companyMeta)) {
    await upsert('COMPANIES', company_id, { company_id, name, company_type, domain, core_tech_stack_ids });
  }
  for (const job of jobs) await upsert('JOB_POSTINGS', job.job_id, job);
  console.log(`Loaded ${SNAPSHOT_DATE} snapshot: ${jobs.length} jobs, ${Object.keys(companyMeta).length} companies`);
  console.log(`Portfolio basis: ${PORTFOLIO.version}, ${PORTFOLIO.total_pages} pages`);
  console.log('USER_JOBS was not modified.');
}
run().catch((error) => { console.error(error.message); process.exitCode = 1; });
