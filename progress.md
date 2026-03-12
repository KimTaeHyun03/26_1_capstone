# 작업 진행 현황 요약

> 기준일: 2026-03-12
> 브랜치: feature/health (현재 작업 중)

---

## 완료된 작업

### 1단계 — 기반 인프라
| 항목 | 상태 | 비고 |
|------|------|------|
| 프론트엔드 초기 세팅 | ✅ | React + TS + Vite + Tailwind + shadcn/ui |
| 프론트엔드 라이브러리 설치 | ✅ | axios, Redux Toolkit, React Query, React Hook Form, Zod, date-fns |
| 백엔드 Express 서버 기본 세팅 | ✅ | index.ts + 라이브러리 설치 |
| Supabase 프로젝트 생성 | ✅ | 개발용 (운영용은 배포 단계에서) |
| DB 테이블 8개 생성 | ✅ | users, pets, feeding_schedules, health_logs, dangerous_foods, guide_content, training_guides, push_subscriptions |
| Supabase RLS 정책 설정 | ✅ | 8개 테이블 각각 |
| updated_at 자동 갱신 트리거 | ✅ | users, pets 테이블 |
| API 키 발급 및 환경변수 세팅 | ✅ | 네이버, 기상청, Gemini, Supabase, VAPID |

### 2단계 — 백엔드 코어
| 항목 | 상태 | 비고 |
|------|------|------|
| Supabase 클라이언트 초기화 | ✅ | service_role 키 사용 |
| JWT 인증 미들웨어 | ✅ | `server/src/middleware/auth.ts` |
| 회원가입 API | ✅ | `POST /api/auth/register` |
| 로그인 API | ✅ | `POST /api/auth/login` |
| 로그아웃 API | ✅ | `POST /api/auth/logout` (버그 수정 완료) |
| 반려동물 CRUD API | ✅ | `GET/POST/PUT/DELETE /api/pets` |

### 3단계 — 프론트엔드 코어
| 항목 | 상태 | 비고 |
|------|------|------|
| Supabase 클라이언트 초기화 | ✅ | anon key 사용 |
| axios 인스턴스 설정 | ✅ | 토큰 자동 삽입, 401 인터셉터 |
| Redux store 설정 | ✅ | auth slice, pet slice |
| React Query Provider 설정 | ✅ | main.tsx |
| PrivateRoute 컴포넌트 | ✅ | 미인증 시 /login 리다이렉트 |
| 로그인 페이지 | ✅ | React Hook Form + Zod 유효성 검사 |
| 회원가입 페이지 | ✅ | React Hook Form + Zod 유효성 검사 |

### 4단계 — 기능 페이지 (3~4주차)
| 기능 | 백엔드 | 프론트 | 데이터 | 비고 |
|------|--------|--------|--------|------|
| ① 초보 보호자 가이드 | ✅ `/api/guide` | ✅ `Guide.tsx` | ✅ | 강아지·고양이 각 5카테고리 |
| ⑤ 위험 음식 검색 | ✅ `/api/foods/search` | ✅ `Food.tsx` | ✅ | ASPCA 자료 기반 23개 항목 |
| ③ 증상 기반 건강 체크 | ✅ `/api/health` | ✅ `Health.tsx` | - | Gemini 연동, 429 오류 확인 중 |

---

## 현재 이슈

| 이슈 | 원인 | 상태 |
|------|------|------|
| Health Gemini 429 오류 | Gemini 무료 티어 분당 요청 제한 초과 | 일시적, 잠시 후 재시도 시 해결 |

---

## 미완료 작업

### 4단계 — 기능 페이지 (3~4주차)
- [ ] ⑦ `Training.tsx` — 훈련 가이드
  - [ ] training_guides 데이터 입력
  - [ ] `/api/training` 백엔드
  - [ ] `Training.tsx` 프론트

### 4단계 — 기능 페이지 (5~6주차)
- [ ] ② `Feeding.tsx` — 급식 알림·급여량 계산기
  - [ ] `/api/feeding` 백엔드
  - [ ] Service Worker (Web Push)
  - [ ] `/api/push/subscribe`, `/api/push/unsubscribe`
  - [ ] 서버 cron job (node-cron)
- [ ] ⑥ `Walk.tsx` — 산책 가능 여부
  - [ ] `server/src/lib/weather.ts` (격자 좌표 변환)
  - [ ] `/api/walk` 백엔드

### 4단계 — 기능 페이지 (7~8주차)
- [ ] ④ `Map.tsx` — 동물병원·보호소 찾기
  - [ ] `/api/map/hospitals`, `/api/map/shelters` 백엔드
  - [ ] `client/src/lib/naver.ts` 프론트

### 4단계 — 기능 페이지 (9~10주차)
- [ ] ⑧ `AiDiagnosis.tsx` — AI 병명 예측·병원 추천
  - [ ] `/api/ai/diagnosis` 백엔드
  - [ ] Gemini 수의학 프롬프트 설계

### 5단계 — 정적 콘텐츠 데이터
- [ ] `training_guides` 데이터 SQL 작성
- [ ] `/api/foods/chat` AI 음식 안전성 채팅 (Gemini)

### 마무리
- [ ] UI/UX 개선, 반응형 마무리
- [ ] 전체 테스트 및 버그 수정
- [ ] Cloudtype 배포 설정
- [ ] 발표 준비

---

## 브랜치 현황

| 브랜치 | 상태 | 내용 |
|--------|------|------|
| `main` | 유지 | 배포용 |
| `develop` | 최신화 | 개발 통합 (`feature/food`까지 머지됨) |
| `feature/server-core` | 머지 완료 | 백엔드 코어 |
| `feature/frontend-core` | 머지 완료 | 프론트엔드 코어 |
| `feature/guide` | 머지 완료 | 초보 보호자 가이드 |
| `feature/food` | 머지 완료 | 위험 음식 검색 |
| `feature/health` | **작업 중** | 증상 건강 체크 (Gemini 연동) |

---

## 파일 구조 현황

```
pet_management/
├── client/src/
│   ├── components/
│   │   ├── layout/         # AppLayout, Header, BottomNav
│   │   └── PrivateRoute.tsx
│   ├── lib/
│   │   ├── axios.ts         ✅
│   │   ├── supabase.ts      ✅
│   │   ├── naver.ts         ⬜ (7~8주차)
│   │   └── weather.ts       ⬜ (5~6주차)
│   ├── pages/
│   │   ├── auth/Login.tsx   ✅
│   │   ├── auth/Register.tsx ✅
│   │   ├── Guide.tsx        ✅
│   │   ├── Food.tsx         ✅
│   │   ├── Health.tsx       ✅ (Gemini 429 확인 중)
│   │   ├── Training.tsx     ⬜
│   │   ├── Feeding.tsx      ⬜
│   │   ├── Walk.tsx         ⬜
│   │   ├── Map.tsx          ⬜
│   │   ├── AiDiagnosis.tsx  ⬜
│   │   ├── Home.tsx         ⬜
│   │   └── Pets.tsx         ⬜
│   └── store/
│       ├── authSlice.ts     ✅
│       ├── petSlice.ts      ✅
│       └── index.ts         ✅
├── server/src/
│   ├── controllers/
│   │   ├── auth.ts          ✅
│   │   ├── pets.ts          ✅
│   │   ├── guide.ts         ✅
│   │   ├── foods.ts         ✅
│   │   └── health.ts        ✅
│   ├── routes/
│   │   ├── auth.ts          ✅
│   │   ├── pets.ts          ✅
│   │   ├── guide.ts         ✅
│   │   ├── foods.ts         ✅
│   │   └── health.ts        ✅
│   ├── middleware/auth.ts   ✅
│   ├── lib/
│   │   ├── supabase.ts      ✅
│   │   └── weather.ts       ⬜
│   └── index.ts             ✅
├── data/
│   ├── guide_content.sql    ✅
│   └── dangerous_foods.sql  ✅
└── supabase_schema.sql      ✅
```
