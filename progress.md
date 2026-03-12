# 작업 진행 현황 요약

> 기준일: 2026-03-12
> 브랜치: feature/training (현재 작업 중)

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
| 로그아웃 API | ✅ | `POST /api/auth/logout` |
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

### 4단계 — 기능 페이지
| 기능 | 백엔드 | 프론트 | 데이터 | 비고 |
|------|--------|--------|--------|------|
| ① 초보 보호자 가이드 | ✅ `/api/guide` | ✅ `Guide.tsx` | ✅ | 강아지·고양이 각 5카테고리 |
| ③ 증상 기반 건강 체크 | ✅ `/api/health` | ✅ `Health.tsx` | - | Gemini 2.5 Flash 연동 |
| ⑤ 위험 음식 검색 | ✅ `/api/foods/search` | ✅ `Food.tsx` | ✅ | ASPCA 자료 기반 23개 항목 |
| ⑤ 음식 AI 채팅 | ✅ `/api/foods/chat` | ✅ `Food.tsx` | - | Gemini 2.5 Flash 연동 |
| ⑦ 훈련 가이드 | ✅ `/api/training` | ✅ `Training.tsx` | ✅ | 강아지 전용, 13개 항목 |

### 5단계 — 정적 콘텐츠 데이터
| 항목 | 상태 | 비고 |
|------|------|------|
| dangerous_foods.sql | ✅ | ASPCA 자료 기반 23개 |
| guide_content.sql | ✅ | 강아지·고양이 각 5카테고리 |
| training_guides.sql | ✅ | basic 5개, behavior 5개, trick 3개 |

---

## 현재 이슈

없음

---

## 미완료 작업

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

### AI 튜닝 (전체 AI 기능 구현 완료 후)
- [ ] Health, foods/chat, AiDiagnosis 프롬프트 일괄 튜닝

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
| `develop` | 최신화 | `feature/food` AI 채팅까지 머지됨 |
| `feature/server-core` | 머지 완료 | 백엔드 코어 |
| `feature/frontend-core` | 머지 완료 | 프론트엔드 코어 |
| `feature/guide` | 머지 완료 | 초보 보호자 가이드 |
| `feature/food` | 머지 완료 | 위험 음식 검색 + AI 채팅 |
| `feature/health` | 머지 완료 | 증상 건강 체크 (Gemini 2.5 Flash) |
| `feature/training` | **작업 중** | 훈련 가이드 |

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
│   │   ├── Health.tsx       ✅
│   │   ├── Training.tsx     ✅ 강아지 전용
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
│   │   ├── health.ts        ✅
│   │   └── training.ts      ✅
│   ├── routes/
│   │   ├── auth.ts          ✅
│   │   ├── pets.ts          ✅
│   │   ├── guide.ts         ✅
│   │   ├── foods.ts         ✅
│   │   ├── health.ts        ✅
│   │   └── training.ts      ✅
│   ├── middleware/auth.ts   ✅
│   ├── lib/
│   │   ├── supabase.ts      ✅
│   │   └── weather.ts       ⬜
│   └── index.ts             ✅
├── data/
│   ├── data_sources.md      ✅
│   ├── guide_content.sql    ✅
│   ├── dangerous_foods.sql  ✅
│   └── training_guides.sql  ✅
└── supabase_schema.sql      ✅
```
