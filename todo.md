# TODO

> 기준일: 2026-03-12
> 완료 시 `[ ]` → `[x]` 로 변경

---

## 현재 완료된 것

- [x] 프론트엔드 초기 세팅 (React + TS + Vite + Tailwind + shadcn/ui)
- [x] 프론트엔드 라이브러리 설치 (axios, Redux Toolkit, React Query, React Hook Form, Zod, date-fns)
- [x] App.tsx 라우팅 (14개 페이지 경로 연결)
- [x] 페이지 컴포넌트 파일 생성 (빈 껍데기 — 14개)
- [x] 레이아웃 파일 생성 (AppLayout, Header, BottomNav)
- [x] 백엔드 Express 서버 기본 세팅 (index.ts + 라이브러리 설치)
- [x] 백엔드 폴더 구조 생성 (routes/, controllers/, middleware/)

---

## 1단계 — 기반 인프라

- [x] Supabase 프로젝트 생성 (개발용만 생성, 운영용은 배포 단계에서 생성)
- [x] DB 테이블 8개 생성
  - [x] `users`
  - [x] `pets`
  - [x] `feeding_schedules`
  - [x] `health_logs`
  - [x] `dangerous_foods`
  - [x] `guide_content`
  - [x] `training_guides`
  - [x] `push_subscriptions`
- [x] Supabase RLS 정책 설정 (8개 테이블 각각)
- [x] `client/.env.example` 파일 생성
- [x] `server/.env.example` 파일 생성
- [x] 실제 `.env` 파일 생성 (API 키 입력)
- [x] API 키 발급
  - [x] 네이버 개발자센터 (지도 API + 로컬 검색 API)
  - [x] 기상청 공공데이터포털 (초단기실황 API)
  - [x] Google AI Studio (Gemini Flash API)
  - [x] VAPID 키 생성 (Web Push용)

---

## 2단계 — 백엔드 코어

- [x] `server/src/lib/supabase.ts` — Supabase 클라이언트 초기화 (service_role)
- [x] `server/src/middleware/auth.ts` — JWT 토큰 검증 미들웨어
- [x] 인증 라우터·컨트롤러 (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`)
- [x] pets CRUD 라우터·컨트롤러 (`/api/pets`)
- [x] `server/src/index.ts` 라우터 연결 (TODO 주석 활성화)

---

## 3단계 — 프론트엔드 코어

- [x] `client/src/lib/supabase.ts` — Supabase 클라이언트 초기화
- [x] Redux store 설정 (auth slice, pet slice)
- [x] axios 인스턴스 설정 (baseURL, 인터셉터)
- [x] `Login.tsx` 구현
- [x] `Register.tsx` 구현
- [x] `PrivateRoute` 컴포넌트 추가 (인증 필요 페이지 보호)

---

## 4단계 — 기능 페이지 구현

### 3~4주차 — 콘텐츠 기반 기능

- [x] ① `Guide.tsx` — 초보 보호자 가이드 (종류별 사육 방법, 준비물, 주의사항)
  - [x] `/api/guide` 서버 라우터·컨트롤러
- [ ] ③ `Health.tsx` — 증상 기반 건강 체크 (체크박스 → Gemini 분석 → 결과 저장)
  - [ ] `/api/health` 서버 라우터·컨트롤러
- [x] ⑤ `Food.tsx` — 위험 음식 검색 (pg_trgm 전문 검색) + DB 없는 음식 AI 채팅 문의
  - [x] `/api/foods/search` 서버 라우터·컨트롤러
  - [ ] `/api/foods/chat` 서버 라우터·컨트롤러 (Gemini — 음식 안전성 문의)
- [ ] ⑦ `Training.tsx` — 훈련 가이드 (기초~행동 교정 단계별)
  - [ ] `/api/training` 서버 라우터·컨트롤러

### 5~6주차 — 외부 API (알림·날씨)

- [ ] ② `Feeding.tsx` — 급식 알림·급여량 계산기 (RER 공식 기반)
  - [ ] `/api/feeding` 서버 라우터·컨트롤러
  - [ ] `public/sw.js` — Service Worker (Web Push 수신)
  - [ ] `/api/push/subscribe`, `/api/push/unsubscribe` 라우터
  - [ ] 서버 cron job 설정 (node-cron, 매분 feeding_schedules 체크 → 푸시 발송)
- [ ] ⑥ `Walk.tsx` — 산책 가능 여부 판단 (기상청 초단기실황 API)
  - [ ] `/api/walk` 서버 라우터·컨트롤러
  - [ ] `server/src/lib/weather.ts` — lat/lng → 격자 좌표 변환 + API 호출

### 7~8주차 — 네이버 지도

- [ ] ④ `Map.tsx` — 동물병원·보호소 찾기 (네이버 지도 + 로컬 검색)
  - [ ] `/api/map/hospitals`, `/api/map/shelters` 서버 라우터·컨트롤러
  - [ ] `client/src/lib/naver.ts` — 네이버 지도 API 래퍼

### 9~10주차 — AI 기능

- [ ] ⑧ `AiDiagnosis.tsx` — AI 병명 예측·병원 추천 (Gemini API)
  - [ ] `/api/ai/diagnosis` 서버 라우터·컨트롤러
  - [ ] Gemini 수의학 프롬프트 설계·튜닝

### 11~12주차 — 마무리

- [ ] UI/UX 개선, 반응형 마무리
- [ ] 전체 테스트 및 버그 수정
- [ ] Cloudtype 배포 설정 (프론트 + 백엔드)
- [ ] 발표 준비

---

## 5단계 — 정적 콘텐츠 데이터 입력 ⚠️ 일정에서 빠진 작업

- [ ] `dangerous_foods` 데이터 SQL 작성 (ASPCA 자료 기반)
- [ ] `guide_content` 데이터 SQL 작성 (Gemini 초안 생성 후 검토)
- [ ] `training_guides` 데이터 SQL 작성 (Gemini 초안 생성 후 검토)
- [ ] Supabase에 SQL import

---

## 리스크 메모

- 콘텐츠 데이터(dangerous_foods, guide_content, training_guides) 입력 작업이 개발 일정에 명시되지 않음 → **3~4주차 작업 전에 미리 준비 필요**
- Gemini 프롬프트 설계·튜닝은 반복 작업이 많아 9~10주가 빠듯할 수 있음
- Service Worker는 브라우저별 동작 차이 있음 → 테스트 공수 고려
- 기상청 API는 키 발급 + 격자 좌표 변환 초기 세팅에 시간 소요
