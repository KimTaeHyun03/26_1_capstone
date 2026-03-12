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
| ⑤ | 위험 음식 검색 | 유해 식품 검색, 위험도·증상 정보 제공. DB에 없는 음식은 Gemini AI 채팅으로 문의 가능 |
| ⑦ | 훈련 가이드 | 기초 훈련~행동 교정 단계별 방법 제공 |

### 2-2. 외부 API 연동 기능
| # | 기능 | 필요 외부 API |
|---|------|--------------|
| ② | 급식 알림·급여량 계산기 | Web Push API + Service Worker |
| ④ | 동물병원·보호소 찾기 | 네이버 지도 API + 네이버 로컬 검색 API |
| ⑥ | 산책 가능 여부 판단 | 기상청 초단기실황 API |

### 2-3. AI 기반 기능
| # | 기능 | 설명 |
|---|------|------|
| ③ | 증상 기반 건강 체크 | 증상 체크박스 선택 → Gemini API 분석 → 결과 저장, 동물병원 방문 권고 |
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
| **web-push** | Web Push 알림 전송 (VAPID 서명) | 급식 알림 푸시 발송 |
| **node-cron** | 서버 cron job 스케줄러 | 매분 feeding_schedules 체크 후 푸시 발송 |
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
- **Google Gemini Flash API** (확정)
  - 무료 티어: 분당 15 req, 일 1,500 req → 캡스톤 수준에서 사실상 무료
  - Claude API 대비 비용 부담 없이 유사한 성능 제공
  - 수의학 프롬프트 설계로 ③⑧ 기능 구현

### 3-7. 외부 API
| API | 용도 | 비고 |
|-----|------|------|
| 네이버 지도 API | 지도 렌더링 | 월 200,000건까지 무료 (캡스톤 수준에서 충분) |
| 네이버 로컬 검색 API | 동물병원·보호소 검색 | 네이버 개발자 센터에서 키 발급 |
| 기상청 초단기실황 API | 날씨 데이터 (산책 판단) | 국내 서비스, 한국어, 무료. 공공데이터포털에서 키 발급 |
| Web Push API (PWA) | 급식 알림 푸시 | Service Worker + VAPID 키. Android 완전 지원, iOS 16.4+ 홈화면 추가 시 지원 |

### 3-7-1. 기상청 초단기실황 API 상세

- **엔드포인트**: `GET https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst`
- **왜 초단기실황?**: 산책 판단은 "지금 날씨"가 필요 → 예보 아닌 실황 API 사용

**요청 파라미터:**
| 파라미터 | 값 | 설명 |
|---------|-----|------|
| serviceKey | API 키 | 공공데이터포털 인증키 |
| dataType | JSON | 응답 형식 |
| base_date | YYYYMMDD | 조회 날짜 (오늘) |
| base_time | HH00 | 조회 시각 (정시, 매시 30분 이후 조회 가능) |
| nx | 정수 | 격자 X 좌표 |
| ny | 정수 | 격자 Y 좌표 |

**lat/lng → 격자 좌표(nx, ny) 변환:**
기상청은 위경도 대신 Lambert 투영 격자 좌표를 사용. 서버에서 아래 공식으로 변환:
```js
// 변환 상수 (기상청 제공)
const RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0;
const OLON = 126.0, OLAT = 38.0, XO = 43, YO = 136;
// 변환 함수는 기상청 공식 예제 코드 사용 (server/src/lib/weather.ts에 구현)
```

**주요 응답 필드 (category):**
| category | 설명 | 값 |
|----------|------|-----|
| T1H | 기온 (°C) | 숫자 |
| PTY | 강수형태 | 0:없음, 1:비, 2:비/눈, 3:눈, 5:빗방울, 6:빗방울눈날림, 7:눈날림 |
| RN1 | 1시간 강수량 (mm) | 숫자 |
| WSD | 풍속 (m/s) | 숫자 |

**산책 판단 로직 연결:**
- `T1H` → 기온 기준 판단 (research.md 6번 표)
- `PTY` ≠ 0 → 강수 있음 → 주의 🟡
- 뇌우(천둥번개)는 초단기실황에 없음 → 단기예보 `LGT` 항목으로 보완하거나 생략

### 3-7-2. 급식 알림 트리거 방식

**서버 cron + Web Push 방식으로 확정**

```
[서버 cron 1분마다 실행]
  → feeding_schedules 조회 (현재 시각 HH:MM과 일치하는 스케줄)
  → 해당 pet의 owner user_id 조회
  → push_subscriptions 테이블에서 구독 정보 조회
  → Web Push 알림 전송 (VAPID 서명)
```

- 서버에 `node-cron` 라이브러리 추가 완료 (3-4 백엔드 라이브러리 목록 참고)
- 클라이언트는 Service Worker 등록 후 구독 정보를 서버에 저장 (push_subscriptions 테이블)
- `push_subscriptions` 테이블 DB 설계에 추가 완료 (7번 DB 설계 참고)

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

## 5. 급여량 계산 공식

### 공식 (방식 C — RER 칼로리 기반 + 표준 사료 환산)

```
RER(kcal)         = 70 × 체중(kg)^0.75
하루 필요 칼로리  = RER × 생애단계 계수
하루 급여량(g)    = 하루 필요 칼로리 ÷ 3.5
```
> 표준 건식 사료 기준: 350kcal/100g → 1g당 3.5kcal
> 결과 출력 시 "사료 종류에 따라 ±10~15% 차이가 있을 수 있습니다" 안내 문구 표시

> **출처**
> - WSAVA 글로벌 영양평가 가이드라인 (한국동물병원협회 번역본), p.12
>   - RER 개념 및 MER이 중성화 여부·연령대·활동성·BCS·성별·환경에 따라 달라짐을 명시
>   - https://wsava.org/global-guidelines/global-nutrition-guidelines/
> - National Research Council. *Nutrient Requirements of Dogs and Cats*. National Academies Press, 2006. (WSAVA 가이드라인 참고자료 4번 — RER 공식 원출처, 단행본으로 URL 없음)

### 생애단계 계수

| 생애단계 | 계수 |
|----------|------|
| 퍼피/키튼 (1세 미만) | 2.5 |
| 성체 중성화 | 1.6 |
| 성체 미중성화 | 1.8 |
| 노령 강아지 (7세+) | 1.4 |
| 노령 고양이 (10세+) | 1.1 |

### 입력 / 출력

- **입력**: 종(강아지/고양이), 나이, 체중(kg), 중성화 여부
- **출력**: 하루 급여량(g)
- 소형견/대형견 별도 구분 없음 — 체중을 직접 입력받으므로 공식에서 자동 반영됨

---

## 6. 산책 가능 여부 판단 기준

> 고양이는 산책 기능 미제공 — 강아지 전용, 앱 내 명시 필요

### 체중 구분

| 구분 | 체중 |
|------|------|
| 소형견 | 10kg 미만 |
| 중형견 | 10kg 이상 ~ 20kg 미만 |
| 대형견 | 20kg 이상 |

### 기온 기준

| 기온 범위 | 소형견 (<10kg) | 중형견 (10~20kg) | 대형견 (20kg+) |
|-----------|---------------|-----------------|---------------|
| -7°C 미만 | 위험 🔴 | 위험 🔴 | 위험 🔴 |
| -7°C 이상 ~ 0°C 미만 | 위험 🔴 | 주의 🟡 | 주의 🟡 |
| 0°C 이상 ~ 7°C 미만 | 주의 🟡 | 적합 🟢 | 적합 🟢 |
| 7°C 이상 ~ 25°C 미만 | 적합 🟢 | 적합 🟢 | 적합 🟢 |
| 25°C 이상 ~ 32°C 이하 | 주의 🟡 | 주의 🟡 | 주의 🟡 |
| 32°C 초과 | 위험 🔴 | 위험 🔴 | 위험 🔴 |

### 날씨 상태 기준 (전 견종 공통)

| 날씨 | 판단 |
|------|------|
| 비, 눈, 천둥번개 | 주의 🟡 |

### 판단 결과

| 결과 | 의미 |
|------|------|
| 🟢 적합 | 산책 가능 |
| 🟡 주의 | 짧게, 주의하며 산책 |
| 🔴 위험 | 산책 비권장 |

### 앱 내 안내 문구
> "본 기준은 PetMD 자료를 참고하였으며, 반려동물 상태에 따라 다를 수 있습니다. 수의사 상담을 권장합니다."

> **출처**
> - PetMD — *How Cold Is Too Cold for Your Dog?*
>   - https://www.petmd.com/dog/care/how-cold-too-cold-dog
> - GoodRx — *What Temperature Is Too Hot or Too Cold to Walk Your Dog?*
>   - https://www.goodrx.com/pet-health/dog/what-temperature-too-hot-for-dogs-to-walk

---

## 7. DB 설계 분석

| 테이블 | 주요 컬럼 | 용도 |
|--------|-----------|------|
| `users` | id, email, nickname, created_at, updated_at | 사용자 계정 (Supabase Auth와 연동) |
| `pets` | id, user_id, name, species(dog/cat), breed, birth_date, weight, neutered | 반려동물 정보, user_id로 users 참조. 나이는 birth_date로 자동 계산 |
| `feeding_schedules` | id, pet_id, time, amount, enabled | 급식 스케줄, pet_id로 pets 참조. time은 `HH:MM` 문자열 형식 (매일 반복이므로 날짜 불필요) |
| `health_logs` | id, pet_id, symptoms(json), diagnosis, created_at | 건강 체크 기록. symptoms는 체크박스 선택형 JSON 배열 (예: ["구토", "무기력"]). diagnosis는 Gemini AI 분석 결과 텍스트 저장 |
| `dangerous_foods` | id, name, risk_level, symptoms, species | 위험 음식 데이터 (정적 콘텐츠) |
| `guide_content` | id, category, species, title, content, step_order | 가이드 콘텐츠 (정적, step_order로 순서 관리). category: preparation·feeding·health·grooming·behavior |
| `training_guides` | id, category, title, steps(json), difficulty | 훈련 가이드, steps를 JSON으로 저장. category: basic(기초)/behavior(교정)/trick(재주) |
| `push_subscriptions` | id, user_id, endpoint, p256dh, auth, created_at | Web Push 구독 정보 저장. user_id로 users 참조. endpoint·p256dh·auth는 브라우저가 생성하는 구독 데이터 |

**관계 요약:**
```
users (1) ──< pets (N) ──< feeding_schedules (N)
          │              └──< health_logs (N)
          └──< push_subscriptions (N)
```

**주목할 설계:**
- `training_guides.steps`를 JSON 컬럼으로 설계 → 훈련 단계가 가변적이므로 JSON이 적합
- `dangerous_foods`, `guide_content`, `training_guides`는 정적 콘텐츠 테이블로, SQL 파일로 직접 작성 후 Supabase에 import
  - `dangerous_foods`: ASPCA 자료 기반 직접 입력 (data_sources.md 참고)
    - `data_sourse.md` 파일에 저장되어있음
  - `guide_content`: Gemini로 초안 생성 후 검토·수정
    - claude로 초안 생성, 검토, 수정함
  - `training_guides`: Gemini로 초안 생성 후 검토·수정
- `users` 테이블은 `public.users`를 별도 생성 → 닉네임, 프로필 사진 등 커스텀 컬럼 저장 가능. 회원가입 시 서버에서 `auth.users`와 `public.users` 동시 생성

**증상 체크박스 목록 (health_logs.symptoms JSON 배열 값, 강아지·고양이 공통):**

| 분류 | 증상 목록 |
|------|----------|
| 소화기 | 구토, 설사, 변비, 식욕 저하, 과식 |
| 호흡기 | 기침, 재채기, 코막힘, 호흡 곤란 |
| 행동 | 무기력, 과도한 긁음, 공격성 증가, 숨기 |
| 외형 | 눈곱·눈물, 털 빠짐, 피부 발진, 절뚝거림 |
| 배뇨 | 소변 횟수 증가, 혈뇨, 소변 못 봄 |
| 기타 | 체중 감소, 발열, 과도한 음수량 |

**training_guides.steps JSON 구조:**
```json
[
  { "step": 1, "title": "단계명", "description": "단계 설명" },
  { "step": 2, "title": "단계명", "description": "단계 설명" }
]
```

---

## 8. Supabase RLS 정책

> RLS 없으면 다른 유저의 데이터에 접근 가능 → 보안 필수

| 테이블 | 정책 |
|--------|------|
| `users` | 본인 데이터만 조회·수정 가능 |
| `pets` | user_id가 본인인 row만 CRUD 가능 |
| `feeding_schedules` | pet의 owner가 본인인 경우만 CRUD 가능 |
| `health_logs` | pet의 owner가 본인인 경우만 CRUD 가능 |
| `dangerous_foods` | 전체 공개 읽기, 수정 불가 |
| `guide_content` | 전체 공개 읽기, 수정 불가 |
| `training_guides` | 전체 공개 읽기, 수정 불가 |
| `push_subscriptions` | 본인 데이터만 CRUD 가능 |

---

## 9. API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/pets` | 내 반려동물 목록 조회 |
| POST | `/api/pets` | 반려동물 등록 |
| PUT | `/api/pets/:id` | 반려동물 정보 수정 |
| DELETE | `/api/pets/:id` | 반려동물 삭제 |
| GET | `/api/feeding/:petId` | 급식 스케줄 조회 |
| POST | `/api/feeding` | 급식 스케줄 등록 |
| PUT | `/api/feeding/:id` | 급식 스케줄 수정 |
| DELETE | `/api/feeding/:id` | 급식 스케줄 삭제 |
| GET | `/api/health/:petId` | 건강 기록 조회 |
| POST | `/api/health` | 건강 체크 기록 저장 |
| GET | `/api/foods/search?q=` | 위험 음식 검색 |
| POST | `/api/foods/chat` | DB에 없는 음식 AI 안전성 문의 (Gemini) |
| GET | `/api/guide?species=` | 보호자 가이드 조회 |
| GET | `/api/training?species=` | 훈련 가이드 조회 |
| GET | `/api/map/hospitals?lat=&lng=` | 주변 동물병원 검색 |
| GET | `/api/map/shelters?lat=&lng=` | 주변 보호소 검색 |
| GET | `/api/walk?petId=&lat=&lng=` | 산책 가능 여부 판단 |
| POST | `/api/ai/diagnosis` | AI 병명 예측 |
| POST | `/api/push/subscribe` | 푸시 구독 정보 저장 |
| DELETE | `/api/push/unsubscribe` | 푸시 구독 취소 |

---

## 10. React Router URL 경로

| URL | 페이지 | 인증 필요 |
|-----|--------|-----------|
| `/login` | 로그인 | ❌ |
| `/register` | 회원가입 | ❌ |
| `/guide` | 초보 보호자 가이드 | ❌ |
| `/food` | 위험 음식 검색 | ❌ |
| `/training` | 훈련 가이드 | ❌ |
| `/` | 홈 (대시보드) | ✅ |
| `/pets` | 반려동물 목록 | ✅ |
| `/pets/new` | 반려동물 등록 | ✅ |
| `/pets/:id` | 반려동물 상세 | ✅ |
| `/feeding` | 급식 알림·계산기 | ✅ |
| `/health` | 증상 건강 체크 | ✅ |
| `/map` | 동물병원·보호소 지도 | ✅ |
| `/walk` | 산책 가능 여부 | ✅ |
| `/ai-diagnosis` | AI 병명 예측 | ✅ |

---

## 11. 환경 변수

**client/.env.example**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=
VITE_VAPID_PUBLIC_KEY=
VITE_NAVER_CLIENT_ID=
```

**server/.env.example**
```
PORT=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GEMINI_API_KEY=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
WEATHER_API_KEY=
CLIENT_URL=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

---

## 12. 개발 일정 분석 (12주)

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
- 기상청 초단기실황 API는 공공데이터포털 인증키 발급 및 API 포맷 파악에 초기 시간이 소요됨

---

## 13. 확정 사항

| 항목 | 확정 내용 |
|------|-----------|
| AI 방식 | **Gemini Flash API** — 무료 티어로 캡스톤 수준 충분 |
| 날씨 API | **기상청 초단기실황 API** — 국내 서비스, 한국어, 무료 |
| Node.js 프레임워크 | **Express** — 학습 자료 풍부, 빠른 개발 가능 |

---

## 14. 현재 폴더 상태

```
D:/ysu_26_1/capstone/pet_management/
├── plan.md        # 과제 계획서 (기능 목록, 참여자, 성과물 유형)
├── dev-plan.md    # 개발 구현 계획 (기술 스택, DB 설계, 일정)
├── research.md    # 본 파일
└── .git/          # Git 저장소 초기화 완료 (main 브랜치, origin 원격 연결됨)
```

실제 앱 코드는 아직 없음. 계획 단계.

---

## 15. 시작 순서

1. `npm create vite@latest client -- --template react-ts` 로 프론트 프로젝트 생성
2. `server/` 폴더 생성 후 Node.js + Express 초기 셋업
3. `.env` 파일 생성 및 `.gitignore` 설정
4. Supabase 프로젝트 생성 및 DB 테이블 생성 (위 설계 기준)
5. Supabase Auth 연동 (로그인·회원가입 구현)
6. 반려동물 등록 기능 구현
7. 각 기능 페이지 순서대로 구현
8. Cloudtype에 프론트·백엔드 배포 설정

---

## 16. 다음 단계

1. **API 키 준비**: 네이버 개발자 센터, 기상청 API 인증키, Google AI Studio (Gemini), Supabase 프로젝트 생성
2. **콘텐츠 데이터 생성**: guide_content (6개), training_guides (3개) SQL 파일 작성 (Gemini 초안 활용)
3. **프로젝트 생성**: `npm create vite@latest client -- --template react-ts` 로 코드 작업 시작
