# 🐾 반려동물 통합관리 앱

> 강아지·고양이 보호자를 위한 올인원 반려동물 관리 웹 서비스

- **활동기간**: 2026.03 ~ 2026.06 (12주)
- **소속**: 연성대학교 컴퓨터소프트웨어과 클라우드 융합컴퓨팅 / 캡스톤 디자인 1
- **팀명**: 밥그릇 비었다

<br>

## 목차

- [기획 배경](#-기획-배경)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [나의 역할](#-나의-역할)
- [기능 목록](#-기능-목록)
- [핵심 구현 포인트](#-핵심-구현-포인트)
- [DB 스키마](#-db-스키마)
- [프로젝트 구조](#-프로젝트-구조)
- [기술 선택 이유](#-기술-선택-이유)
- [API 엔드포인트](#-api-엔드포인트)
- [설치 및 실행](#-설치-및-실행)
- [팀원](#-팀원)

<br>

## 📌 기획 배경

반려동물 양육 인구가 빠르게 늘고 있지만, 초보 보호자가 필요한 정보(사육 방법, 건강 이상 징후, 적정 급여량 등)를 한 곳에서 얻기 어렵다는 문제에서 출발했습니다.

- 급식 시간·양을 매번 검색해야 함
- 증상이 생겼을 때 병원에 가야 할지 판단이 어려움
- 위험한 음식 정보가 분산되어 있어 찾기 번거로움
- 날씨에 따른 산책 가능 여부를 직관적으로 알 수 없음

이 문제들을 **하나의 앱에서 해결**하는 것이 목표입니다.

<br>

## 🛠 기술 스택

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

| 라이브러리 | 용도 |
|-----------|------|
| React Router v6 | 클라이언트 사이드 라우팅 |
| Redux Toolkit | 전역 상태 관리 (로그인 유저, 반려동물 정보) |
| TanStack Query | 서버 데이터 캐싱·동기화 |
| React Hook Form + Zod | 폼 상태 관리 및 유효성 검사 |
| axios | HTTP 요청 (인터셉터로 토큰 자동 삽입) |
| shadcn/ui | Radix UI 기반 컴포넌트 라이브러리 |

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

| 라이브러리 | 용도 |
|-----------|------|
| express | HTTP 서버 및 라우팅 |
| @supabase/supabase-js | DB·Auth 연동 (service_role 키) |
| @google/generative-ai | Gemini API 호출 |
| web-push | Web Push 알림 전송 (VAPID) |
| node-cron | 급식 알림 스케줄러 |
| helmet | HTTP 보안 헤더 설정 |
| express-validator | 요청 데이터 유효성 검사 |

### AI / 외부 API
![Gemini](https://img.shields.io/badge/Gemini_API-4285F4?style=flat&logo=google&logoColor=white)

| API | 용도 |
|-----|------|
| Google Gemini 2.5 Flash | 증상 건강 체크, 위험 음식 AI 문의, AI 병명 예측 |
| 네이버 지도 API | 지도 렌더링 |
| 네이버 로컬 검색 API | 동물병원·보호소 검색 |
| 기상청 초단기실황 API | 실시간 날씨 데이터 (산책 판단) |
| Web Push API | 급식 알림 푸시 (Service Worker + VAPID) |

### 배포
![Cloudtype](https://img.shields.io/badge/Cloudtype-000000?style=flat)

<br>

## 🏗 시스템 아키텍처

```
[React 브라우저]
     │
     │  axios (JWT 자동 삽입)
     ▼
[Node.js / Express 서버]  ───────────────────────────────────┐
     │                                                        │
     ├── Supabase (PostgreSQL + Auth + Storage)               │
     │      └── RLS 정책으로 본인 데이터만 접근 가능          │
     │                                                        │
     ├── Google Gemini 2.5 Flash API                          │
     │                                                        │
     ├── 네이버 지도 / 로컬 검색 API                          │
     │                                                        │
     ├── 기상청 초단기실황 API                                 │
     │                                                        │
     └── Web Push (node-cron + VAPID)  ──────────────────────┘
              └── 매분 feeding_schedules 조회 → 푸시 발송
```

> **API 키 보안 원칙**: Gemini, 네이버, 기상청, Supabase service_role 키는 절대 프론트엔드에 노출하지 않고 서버의 `.env`에서만 관리합니다.

<br>

## 👤 나의 역할

> 팀 학생대표 (김태현)

| 영역 | 담당 내용 |
|------|-----------|
| 프로젝트 설계 | 기능 기획, 기술 스택 선정, DB 스키마 설계, API 엔드포인트 설계 |
| 백엔드 전체 | Express 서버 구축, 인증 미들웨어, 전체 API 라우터 및 컨트롤러 |
| 프론트엔드 | React 프로젝트 세팅, Redux 상태 관리, 주요 페이지 구현 |
| AI 연동 | Gemini 2.5 Flash API 연동, 수의학 프롬프트 설계 |
| 인프라 | Supabase 프로젝트 생성, RLS 정책 설정, Cloudtype 배포 |
| 문서화 | 기술 리서치 문서 작성, 개발 일정 관리, 브랜치 전략 수립 |

<br>

## ✅ 기능 목록

| # | 기능 | 상태 | 설명 |
|---|------|------|------|
| ① | 초보 보호자 가이드 | ✅ 완료 | 강아지·고양이 각 5카테고리 (준비물·사육·건강·미용·행동), Supabase DB 연동 |
| ② | 급식 알림·급여량 계산기 | 🔄 진행 예정 | WSAVA 기준 RER 칼로리 공식 기반 자동 계산, Web Push 알림 |
| ③ | 증상 기반 건강 체크 | ✅ 완료 | 체크박스 증상 선택 → Gemini API 분석 → 결과 저장·조회 |
| ④ | 동물병원·보호소 찾기 | 🔄 진행 예정 | 현재 위치 기반 네이버 지도 렌더링, 네이버 로컬 검색 연동 |
| ⑤ | 위험 음식 검색 | ✅ 완료 | ASPCA 자료 기반 23개 항목 DB 검색, DB 미존재 음식은 Gemini AI 문의 |
| ⑥ | 산책 가능 여부 판단 | 🔄 진행 예정 | 기상청 실황 API + 체중 기반 판단 (PetMD 기준 적용) |
| ⑦ | 훈련 가이드 | ✅ 완료 | 기초·행동교정·재주 13개 항목, 단계별 방법 제공 (강아지 전용) |
| ⑧ | AI 병명 예측·병원 추천 | 🔄 진행 예정 | Gemini 수의학 프롬프트 설계, 증상→병명 예측 |

<br>

## 🔑 핵심 구현 포인트

### 1. API 키 보안 아키텍처
브라우저에서 외부 API를 직접 호출하면 API 키가 노출됩니다. 모든 외부 API 호출을 Node.js 서버를 통해 중계하여 키를 서버의 `.env`에서만 관리합니다.

```
브라우저  →  /api/walk  →  서버  →  기상청 API (키 포함)
                              └  →  네이버 API (키 포함)
```

### 2. 기상청 Lambert 격자 좌표 변환
기상청 API는 위경도 대신 격자 좌표(nx, ny)를 사용합니다. 브라우저 Geolocation으로 얻은 위경도를 서버에서 Lambert 투영 공식으로 변환합니다.

```ts
// server/src/lib/weather.ts
const RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0;
const OLON = 126.0, OLAT = 38.0, XO = 43, YO = 136;
// 기상청 공식 제공 Lambert 변환 공식 적용
```

### 3. 산책 가능 여부 판단 로직
체중(소형·중형·대형)과 실시간 기온·강수형태를 조합해 3단계(적합/주의/위험)로 판단합니다. 기준은 PetMD 자료를 참고했습니다.

| 기온 범위 | 소형견 (<10kg) | 중형견 (10~20kg) | 대형견 (20kg+) |
|-----------|:---:|:---:|:---:|
| -7°C 미만 | 위험 🔴 | 위험 🔴 | 위험 🔴 |
| -7°C ~ 0°C | 위험 🔴 | 주의 🟡 | 주의 🟡 |
| 0°C ~ 7°C | 주의 🟡 | 적합 🟢 | 적합 🟢 |
| 7°C ~ 25°C | 적합 🟢 | 적합 🟢 | 적합 🟢 |
| 25°C ~ 32°C | 주의 🟡 | 주의 🟡 | 주의 🟡 |
| 32°C 초과 | 위험 🔴 | 위험 🔴 | 위험 🔴 |

### 4. 급식 알림 — 서버 cron + Web Push
클라이언트 타이머 방식은 앱이 꺼지면 동작하지 않습니다. 서버 cron이 매분 DB를 조회해 일치하는 스케줄에 Web Push 알림을 발송합니다.

```
[node-cron: 매분 실행]
  → feeding_schedules에서 현재 HH:MM과 일치하는 스케줄 조회
  → pet → user_id → push_subscriptions 조회
  → VAPID 서명으로 Web Push 발송
```

### 5. 급여량 계산 공식
WSAVA 글로벌 영양평가 가이드라인 기반 RER(휴식 에너지 요구량) 공식을 적용했습니다.

```
RER(kcal) = 70 × 체중(kg)^0.75
하루 필요 칼로리 = RER × 생애단계 계수
하루 급여량(g) = 하루 필요 칼로리 ÷ 3.5  (건식 사료 기준: 350kcal/100g)
```

| 생애단계 | 계수 |
|----------|:----:|
| 퍼피/키튼 (1세 미만) | 2.5 |
| 성체 중성화 | 1.6 |
| 성체 미중성화 | 1.8 |
| 노령 강아지 (7세+) | 1.4 |
| 노령 고양이 (10세+) | 1.1 |

### 6. Supabase RLS (Row Level Security)
Supabase anon key는 프론트에 노출될 수 있으므로, 테이블마다 RLS 정책을 설정해 본인 데이터에만 접근 가능하도록 했습니다.

| 테이블 | 정책 |
|--------|------|
| pets | user_id가 본인인 row만 CRUD |
| feeding_schedules | pet의 owner가 본인인 경우만 CRUD |
| health_logs | pet의 owner가 본인인 경우만 CRUD |
| dangerous_foods | 전체 공개 읽기 전용 |
| guide_content | 전체 공개 읽기 전용 |

<br>

## 🗄 DB 스키마

```
users (1) ──< pets (N) ──< feeding_schedules (N)
          │              └──< health_logs (N)
          └──< push_subscriptions (N)
```

| 테이블 | 주요 컬럼 | 용도 |
|--------|-----------|------|
| `users` | id, email, nickname | Supabase Auth와 연동, 커스텀 프로필 |
| `pets` | user_id, name, species, breed, birth_date, weight, neutered | 반려동물 정보 |
| `feeding_schedules` | pet_id, time(HH:MM), amount, enabled | 급식 스케줄 (매일 반복) |
| `health_logs` | pet_id, symptoms(json), diagnosis | 건강 체크 기록 + Gemini 분석 결과 |
| `dangerous_foods` | name, risk_level, symptoms, species | 위험 음식 정적 데이터 |
| `guide_content` | category, species, title, content, step_order | 보호자 가이드 정적 데이터 |
| `training_guides` | category, title, steps(json), difficulty | 훈련 가이드 정적 데이터 |
| `push_subscriptions` | user_id, endpoint, p256dh, auth | Web Push 구독 정보 |

<br>

## 📁 프로젝트 구조

```
pet_management/
├── client/                         # React 프론트엔드
│   ├── public/
│   │   └── sw.js                   # Service Worker (Web Push)
│   └── src/
│       ├── pages/
│       │   ├── auth/               # 로그인·회원가입
│       │   ├── Guide.tsx           # ① 초보 보호자 가이드
│       │   ├── Feeding.tsx         # ② 급식 알림·급여량 계산기
│       │   ├── Health.tsx          # ③ 증상 기반 건강 체크
│       │   ├── Map.tsx             # ④ 동물병원·보호소 찾기
│       │   ├── Food.tsx            # ⑤ 위험 음식 검색
│       │   ├── Walk.tsx            # ⑥ 산책 가능 여부
│       │   ├── Training.tsx        # ⑦ 훈련 가이드
│       │   └── AiDiagnosis.tsx     # ⑧ AI 병명 예측
│       ├── components/             # 공통 UI 컴포넌트
│       ├── store/                  # Redux (authSlice, petSlice)
│       ├── hooks/                  # 커스텀 훅
│       └── lib/                    # axios, supabase, naver, weather
├── server/                         # Node.js 백엔드
│   └── src/
│       ├── routes/                 # API 라우터
│       ├── controllers/            # 비즈니스 로직
│       ├── middleware/auth.ts      # JWT 인증 미들웨어
│       └── lib/                    # supabase, weather 유틸
├── data/
│   ├── dangerous_foods.sql         # ASPCA 기반 23개
│   ├── guide_content.sql           # 강아지·고양이 각 5카테고리
│   └── training_guides.sql         # 13개 훈련 항목
└── supabase_schema.sql             # 8개 테이블 + RLS + 트리거
```

<br>

## 🧩 기술 선택 이유

| 기술 | 선택 이유 |
|------|-----------|
| **Supabase** | PostgreSQL + 인증 + 스토리지를 하나의 플랫폼에서 제공. 별도 인증 서버 구축 없이 JWT 기반 인증 가능 |
| **Gemini Flash API** | 무료 티어(분당 15req, 일 1,500req)가 캡스톤 수준에서 충분. 수의학 도메인 응답 품질 검증 |
| **기상청 초단기실황 API** | 산책 판단은 "예보"가 아닌 "지금 날씨"가 필요. 국내 서비스로 한국어 대응, 완전 무료 |
| **node-cron + Web Push** | 클라이언트 타이머는 앱 종료 시 동작 불가. 서버 cron으로 안정적 알림 보장 |
| **Redux Toolkit + TanStack Query 분리** | 로그인 상태 등 UI 전역 상태는 Redux, DB 조회 데이터 캐싱은 React Query로 역할 분리 |

<br>

## 📡 API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|:----:|
| POST | `/api/auth/register` | 회원가입 | ❌ |
| POST | `/api/auth/login` | 로그인 | ❌ |
| POST | `/api/auth/logout` | 로그아웃 | ✅ |
| GET | `/api/pets` | 내 반려동물 목록 | ✅ |
| POST | `/api/pets` | 반려동물 등록 | ✅ |
| PUT | `/api/pets/:id` | 반려동물 수정 | ✅ |
| DELETE | `/api/pets/:id` | 반려동물 삭제 | ✅ |
| GET | `/api/feeding/:petId` | 급식 스케줄 조회 | ✅ |
| POST | `/api/feeding` | 급식 스케줄 등록 | ✅ |
| GET | `/api/health/:petId` | 건강 기록 조회 | ✅ |
| POST | `/api/health` | 건강 체크 (Gemini 분석) | ✅ |
| GET | `/api/foods/search?q=` | 위험 음식 검색 | ❌ |
| POST | `/api/foods/chat` | AI 음식 안전성 문의 | ❌ |
| GET | `/api/guide?species=` | 보호자 가이드 조회 | ❌ |
| GET | `/api/training?species=` | 훈련 가이드 조회 | ❌ |
| GET | `/api/map/hospitals?lat=&lng=` | 주변 동물병원 검색 | ✅ |
| GET | `/api/map/shelters?lat=&lng=` | 주변 보호소 검색 | ✅ |
| GET | `/api/walk?petId=&lat=&lng=` | 산책 가능 여부 판단 | ✅ |
| POST | `/api/ai/diagnosis` | AI 병명 예측 | ✅ |
| POST | `/api/push/subscribe` | 푸시 구독 등록 | ✅ |
| DELETE | `/api/push/unsubscribe` | 푸시 구독 취소 | ✅ |

<br>

## ⚙️ 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/your-repo/pet_management.git
cd pet_management
```

### 2. 환경변수 설정

```bash
# 프론트엔드
cp client/.env.example client/.env.development
# 백엔드
cp server/.env.example server/.env
```

**client/.env.development**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_NAVER_CLIENT_ID=your_naver_client_id
```

**server/.env**
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
WEATHER_API_KEY=your_weather_api_key
CLIENT_URL=http://localhost:5173
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### 3. 실행

```bash
# 프론트엔드
cd client
npm install
npm run dev

# 백엔드
cd server
npm install
npm run dev
```

<br>

## 🖼 스크린샷

> 추후 추가 예정

<br>

## 🔗 배포 URL

> 추후 추가 예정

<br>

## 👥 팀원

| # | 역할 | 이름 |
|---|------|------|
| 1 | 지도교수 | 우호진 |
| 2 | 학생대표 | 김태현 |
| 3 | 학생 | 장윤서 |
| 4 | 학생 | 김기연 |
| 5 | 학생 | 김찬영 |
| 6 | 기업멘토 | 미정 |
