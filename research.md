# 프로젝트 리서치 보고서

> 작성일: 2026-03-10
> 분석 대상: `plan.md`, `dev-plan.md`

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 과제명 | 반려동물(강아지·고양이) 통합관리 앱 |
| 교과 | 캡스톤 디자인 1 (co-PBL 산학공동운영형) |
| 학년/과정 | 3학년 / 클라우드 융합컴퓨팅 |
| 활동기간 | 2026.03 ~ 2026.06 (약 12주) |
| 학생대표 | 김태현 |
| 지도교수 | 우호진 |

---

## 2. 기능 목록 및 분류

총 8개의 핵심 기능이 있으며, 구현 복잡도 기준으로 3가지 유형으로 분류할 수 있다.

### 2-1. 콘텐츠 기반 기능 (DB 중심, 외부 API 불필요)
| # | 기능 | 설명 |
|---|------|------|
| ① | 초보 보호자 가이드 | 종류별 사육 방법, 준비물, 주의사항 단계별 안내 |
| ⑤ | 위험 음식 검색 | 유해 식품 검색, 위험도·증상 정보 제공 |
| ⑦ | 훈련 가이드 | 기초 훈련~행동 교정 단계별 방법 제공 |

### 2-2. 외부 API 연동 기능
| # | 기능 | 필요 외부 API |
|---|------|--------------|
| ② | 급식 알림·급여량 계산기 | Web Push API + Service Worker |
| ④ | 동물병원·보호소 찾기 | 네이버 지도 API + 네이버 로컬 검색 API |
| ⑥ | 산책 가능 여부 판단 | 기상청 단기예보 API or OpenWeatherMap |

### 2-3. AI 기반 기능
| # | 기능 | 설명 |
|---|------|------|
| ③ | 증상 기반 건강 체크 | DB 매핑 + AI API 보완, 동물병원 방문 권고 |
| ⑧ | AI 병명 예측·병원 추천 | 수의학 프롬프트 설계, 증상→병명 예측 + 병원 추천 |

---

## 3. 기술 스택 상세 분석

### 3-1. 프론트엔드 코어
- **React + TypeScript**: 컴포넌트 기반 UI, 타입 안전성 확보
- **Vite**: 빠른 개발 서버 및 번들러 (CRA 대신 권장)
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **shadcn/ui**: Radix UI 기반 컴포넌트 라이브러리

### 3-2. 프론트엔드 라이브러리
| 라이브러리 | 용도 | 비고 |
|-----------|------|------|
| **axios** | 서버 API 통신 (HTTP 요청) | fetch 대비 인터셉터·에러 처리 편리 |
| **React Router v6** | 클라이언트 사이드 라우팅 | 페이지 전환 |
| **Redux Toolkit** | 전역 상태 관리 (로그인 유저, 반려동물 정보 등) | 보일러플레이트 최소화된 Redux |
| **React Query (TanStack Query)** | 서버 데이터 캐싱·동기화 | axios와 함께 사용, 로딩/에러 상태 자동 처리 |
| **React Hook Form** | 폼 상태 관리 및 유효성 검사 | 로그인·회원가입·반려동물 등록 폼 |
| **Zod** | 스키마 기반 유효성 검사 | React Hook Form과 조합하여 사용 |
| **date-fns** | 날짜 포맷·계산 | 급식 알림 시간, 나이 계산 등 |

> **Redux Toolkit vs React Query 역할 분리**
> - Redux Toolkit: 로그인 상태, 현재 선택된 반려동물 등 **앱 전역 UI 상태**
> - React Query: DB에서 가져오는 pets, health_logs 등 **서버 데이터 캐싱**

### 3-3. 백엔드 코어
- **Node.js + Express**: 별도 백엔드 서버로 API 라우팅, 외부 API 키 보호, 비즈니스 로직 처리
- **Supabase**: PostgreSQL + Auth + Storage 통합 플랫폼
  - DB·인증·파일 저장 담당
  - `pg_trgm` 확장으로 위험 음식 전문 검색(⑤) 구현 예정

### 3-4. 백엔드 라이브러리
| 라이브러리 | 용도 | 비고 |
|-----------|------|------|
| **express** | HTTP 서버 및 라우팅 | |
| **dotenv** | `.env` 파일로 API 키 등 환경변수 관리 | 보안 민감 정보 관리 핵심 |
| **cors** | 프론트-백 간 CORS 허용 설정 | client → server 요청 허용 |
| **@supabase/supabase-js** | Supabase DB·Auth 연동 | 서버에서 service_role 키로 사용 |
| **@google/generative-ai** | Gemini API 호출 | 서버에서만 사용 (키 노출 방지) |
| **helmet** | HTTP 보안 헤더 설정 | 기본 보안 강화 |
| **express-validator** | 요청 데이터 유효성 검사 | |

### 3-5. 보안 민감 정보 관리
API 키 등 민감 정보는 **절대 프론트엔드(브라우저)에 노출하지 않는다.**

```
[React 브라우저]  --axios-->  [Node.js 서버]  -->  [Supabase / Gemini / 네이버 / 기상청]
  (API 키 없음)                (API 키는 .env에만 보관)
```

- 서버의 `server/.env`에서만 API 키 관리, `.gitignore`에 필수 추가
- Supabase `anon key`는 프론트에서 직접 사용 가능하나 **RLS 정책 설정 필수**
- Supabase `service_role key`는 서버에서만 사용 (RLS 우회 가능하여 절대 노출 금지)

| 키 | 위치 | 주의 |
|----|------|------|
| Supabase anon key | 프론트 가능 | RLS 설정 필수 |
| Supabase service_role key | 서버만 | 절대 프론트 노출 금지 |
| Gemini API key | 서버만 | |
| 네이버 Client Secret | 서버만 | |
| 기상청 API key | 서버만 | |

### 3-6. AI
- **Google Gemini Flash API** (추천)
  - 무료 티어: 분당 15 req, 일 1,500 req → 캡스톤 수준에서 사실상 무료
  - Claude API 대비 비용 부담 없이 유사한 성능 제공
  - 수의학 프롬프트 설계로 ③⑧ 기능 구현

### 3-7. 외부 API
| API | 용도 | 비고 |
|-----|------|------|
| 네이버 지도 API | 지도 렌더링 | 월 200,000건까지 무료 (캡스톤 수준에서 충분) |
| 네이버 로컬 검색 API | 동물병원·보호소 검색 | 네이버 개발자 센터에서 키 발급 |
| 기상청 단기예보 API | 날씨 데이터 (산책 판단) | 국내 서비스, 한국어, 무료 — 추천 |
| OpenWeatherMap | 날씨 데이터 대안 | 영어, 간편하지만 미결정 |
| Web Push API | 급식 알림 푸시 | Service Worker와 연동 |

### 3-8. 배포
- **Cloudtype**: Node.js 백엔드 + React 프론트 모두 배포 가능, 무료 플랜 제공

---

## 4. 프로젝트 디렉토리 구조 분석

React + TypeScript (Vite) + Node.js 백엔드 기반 구조

```
capstone-app/
├── client/                         # React 프론트엔드
│   ├── public/
│   │   └── sw.js                   # Service Worker (Web Push 푸시 알림)
│   ├── src/
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   │   ├── auth/               # 로그인·회원가입
│   │   │   ├── Guide.tsx           # ① 초보 보호자 가이드
│   │   │   ├── Feeding.tsx         # ② 급식 알림·급여량 계산기
│   │   │   ├── Health.tsx          # ③ 증상 기반 건강 체크
│   │   │   ├── Map.tsx             # ④ 동물병원·보호소 찾기
│   │   │   ├── Food.tsx            # ⑤ 위험 음식 검색
│   │   │   ├── Walk.tsx            # ⑥ 산책 가능 여부
│   │   │   ├── Training.tsx        # ⑦ 훈련 가이드
│   │   │   └── AiDiagnosis.tsx     # ⑧ AI 병명 예측·병원 추천
│   │   ├── components/             # 공통 UI 컴포넌트
│   │   ├── hooks/                  # 커스텀 훅
│   │   ├── lib/
│   │   │   ├── supabase.ts         # Supabase 클라이언트 초기화
│   │   │   ├── naver.ts            # 네이버 지도 API 래퍼
│   │   │   └── weather.ts          # 날씨 API 래퍼
│   │   ├── types/                  # TypeScript 타입 정의
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.development            # 프론트 개발 환경 변수 (git 제외)
│   ├── .env.production             # 프론트 운영 환경 변수 (git 제외)
│   ├── .env.example                # 환경 변수 키 목록 샘플 (git 포함)
│   ├── package.json
│   └── tsconfig.json
├── server/                         # Node.js 백엔드
│   ├── src/
│   │   ├── routes/                 # API 라우터
│   │   ├── controllers/            # 컨트롤러
│   │   ├── middleware/             # 미들웨어 (인증 등)
│   │   └── index.ts                # 서버 진입점
│   ├── .env                        # 공통 환경 변수 (git 제외)
│   ├── .env.development            # 서버 개발 환경 변수 (git 제외)
│   ├── .env.production             # 서버 운영 환경 변수 (git 제외)
│   ├── .env.example                # 환경 변수 키 목록 샘플 (git 포함)
│   ├── package.json
│   └── tsconfig.json
└── .gitignore                      # .env 파일 등 git 제외 목록
```

**환경 변수 파일 우선순위 (Vite 기준):**
- `npm run dev` 실행 시: `.env` → `.env.development` 순으로 덮어씀
- `npm run build` 실행 시: `.env` → `.env.production` 순으로 덮어씀
- Node.js 서버는 `NODE_ENV` 값을 보고 코드에서 직접 파일을 선택해서 로드

**각 파일에 담을 내용:**
| 항목 | `.env` | `.env.development` | `.env.production` |
|------|--------|-------------------|------------------|
| 네이버·기상청 API 키 | 공통이면 여기 | - | - |
| Supabase URL·KEY | - | 개발용 프로젝트 키 | 운영용 프로젝트 키 |
| Gemini API 키 | - | 개발용 키 | 운영용 키 |
| API 서버 URL | - | `http://localhost:3000` | Cloudtype 배포 URL |

> Supabase는 개발/운영 프로젝트를 분리하는 것을 권장 — 개발 중 운영 DB를 실수로 수정하는 사고 방지

**특이사항:**
- 프론트(client)와 백엔드(server)를 모노레포 구조로 분리
- API 키(네이버, 기상청, Gemini)는 서버 측에서만 사용 → 키 노출 방지
- `lib/` 는 프론트에서 직접 호출 가능한 Supabase·지도·날씨만 포함, AI 호출은 서버 경유
- `.env.example`은 키 이름만 적고 값은 비워서 git에 커밋 → 팀원 세팅 가이드 역할

---

## 5. DB 설계 분석

| 테이블 | 주요 컬럼 | 용도 |
|--------|-----------|------|
| `users` | id, email, created_at | 사용자 계정 (Supabase Auth와 연동) |
| `pets` | id, user_id, name, species(dog/cat), breed, age, weight | 반려동물 정보, user_id로 users 참조 |
| `feeding_schedules` | id, pet_id, time, amount, enabled | 급식 스케줄, pet_id로 pets 참조 |
| `health_logs` | id, pet_id, symptoms, diagnosis, created_at | 건강 체크 기록 |
| `dangerous_foods` | id, name, risk_level, symptoms, species | 위험 음식 데이터 (정적 콘텐츠) |
| `guide_content` | id, category, species, title, content, step_order | 가이드 콘텐츠 (정적, step_order로 순서 관리) |
| `training_guides` | id, category, title, steps(json), difficulty | 훈련 가이드, steps를 JSON으로 저장 |

**관계 요약:**
```
users (1) ──< pets (N) ──< feeding_schedules (N)
                       └──< health_logs (N)
```

**주목할 설계:**
- `training_guides.steps`를 JSON 컬럼으로 설계 → 훈련 단계가 가변적이므로 JSON이 적합
- `dangerous_foods`, `guide_content`, `training_guides`는 정적 콘텐츠 테이블로, 관리자가 사전에 데이터를 입력해야 서비스 가능
- `users` 테이블은 Supabase Auth의 `auth.users`와 별도로 `public.users`를 만들거나, Auth 메타데이터만 활용하는 방식 중 선택 필요

---

## 6. 개발 일정 분석 (12주)

| 상태 | 주차 | 내용 | 분류 |
|------|------|------|------|
| [X] | 1주 | 프로젝트 셋업 (React+TS, Node.js, Supabase, Cloudtype) | 인프라 |
| [X] | 2주 | 인증(로그인·회원가입), 반려동물 등록 | 기반 기능 |
| [X] | 3~4주 | ①③⑤⑦ 콘텐츠 기반 기능 | DB 중심 |
| [X] | 5~6주 | ②⑥ 급식 알림·산책 판단 | 외부 API |
| [X] | 7~8주 | ④ 네이버 지도 기반 병원·보호소 찾기 | 외부 API |
| [X] | 9~10주 | ⑧ AI 기능 (Gemini API 프롬프트 설계) | AI |
| [X] | 11주 | UI/UX 개선, 반응형 마무리 | 품질 |
| [X] | 12주 | 테스트, 버그 수정, 발표 준비 | 마무리 |

> 구현 완료 시 [X] → [O] 로 변경

**일정 리스크:**
- 콘텐츠 테이블(dangerous_foods, guide_content, training_guides)에 들어갈 실제 데이터 수집·입력 작업이 일정에 명시되어 있지 않음
- Gemini API 프롬프트 설계·튜닝은 반복 작업이 많으므로 9~10주가 빠듯할 수 있음
- Service Worker(Web Push)는 브라우저 환경별 동작 차이가 있어 테스트 공수가 클 수 있음
- 기상청 단기예보 API는 공공데이터포털 인증키 발급 및 API 포맷 파악에 초기 시간이 소요됨

---

## 7. 미결정 사항 및 권고

| 항목 | 옵션 A | 옵션 B | 권고 |
|------|--------|--------|------|
| AI 방식 | Gemini Flash API (무료 티어, 간단) | OpenAI gpt-4o-mini (저렴, 유료) | **Gemini Flash** — 무료 티어로 캡스톤 수준 충분 |
| 날씨 API | 기상청 단기예보 API (한국어, 무료) | OpenWeatherMap (영어, 간편) | **기상청 API** — 국내 서비스이므로 적합, 단 인증키 발급 절차 필요 |
| Node.js 프레임워크 | Express (익숙함, 레퍼런스 많음) | Fastify (빠름, 현대적) | **Express** — 학습 자료 풍부, 빠른 개발 가능 |

---

## 8. 현재 폴더 상태

```
D:/ysu_26_1/capstone/pet_management/
├── plan.md        # 과제 계획서 (기능 목록, 참여자, 성과물 유형)
├── dev-plan.md    # 개발 구현 계획 (기술 스택, DB 설계, 일정)
├── research.md    # 본 파일
└── .git/          # Git 저장소 초기화 완료 (main 브랜치, origin 원격 연결됨)
```

실제 앱 코드는 아직 없음. 계획 단계.

---

## 9. 시작 순서

1. `npm create vite@latest client -- --template react-ts` 로 프론트 프로젝트 생성
2. `server/` 폴더 생성 후 Node.js + Express 초기 셋업
3. `.env` 파일 생성 및 `.gitignore` 설정
4. Supabase 프로젝트 생성 및 DB 테이블 생성 (위 설계 기준)
5. Supabase Auth 연동 (로그인·회원가입 구현)
6. 반려동물 등록 기능 구현
7. 각 기능 페이지 순서대로 구현
8. Cloudtype에 프론트·백엔드 배포 설정

---

## 10. 다음 단계 제안 (계획 단계 기준)

1. **미결정 사항 확정**: 날씨 API 선택, Node.js 프레임워크 결정
2. **콘텐츠 데이터 계획**: guide_content, dangerous_foods, training_guides에 넣을 실제 데이터 수집 방법 결정 (직접 입력 vs 크롤링 vs 공공 API)
3. **API 키 준비**: 네이버 개발자 센터, 기상청 API 인증키, Google AI Studio (Gemini), Supabase 프로젝트 생성
4. **상세 UI 설계**: 와이어프레임 또는 화면 흐름 설계
5. **ERD 상세화**: 현재 DB 설계에서 인덱스, 외래키 제약조건, RLS(Row Level Security) 정책 설계
