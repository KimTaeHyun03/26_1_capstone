# 반려동물 통합관리 웹앱 구현 계획

## 기술 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| 프론트엔드 | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui | React 기반, SSR/SSG 지원, 빠른 개발 |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage) | DB·인증·API 한 번에 해결 |
| AI 기능 | Claude API (우선) or AWS SageMaker (추후) | Claude API가 빠르게 구현 가능 |
| 지도 | 카카오맵 API | 동물병원·보호소 검색 (카카오 로컬 API 포함) |
| 날씨 | 기상청 단기예보 API or OpenWeatherMap | 산책 가능 여부 판단 |
| 푸시 알림 | Web Push API + Service Worker (PWA) | 급식 알림 구현 |
| 배포 | Vercel | Next.js 최적화, 무료 티어 |

---

## 프로젝트 구조

```
capstone-app/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 로그인·회원가입
│   ├── guide/              # ① 초보 보호자 가이드
│   ├── feeding/            # ② 급식 알림·급여량 계산기
│   ├── health/             # ③ 증상 기반 건강 체크
│   ├── map/                # ④ 동물병원·보호소 찾기
│   ├── food/               # ⑤ 위험 음식 검색
│   ├── walk/               # ⑥ 산책 가능 여부
│   ├── training/           # ⑦ 훈련 가이드
│   └── ai-diagnosis/       # ⑧ AI 병명 예측·병원 추천
├── components/             # 공통 컴포넌트
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── kakao.ts            # 카카오맵 API
│   ├── weather.ts          # 날씨 API
│   └── claude.ts           # Claude API (AI 기능)
└── public/
    └── sw.js               # Service Worker (푸시 알림)
```

---

## DB 설계 (Supabase)

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `users` | id, email, created_at |
| `pets` | id, user_id, name, species(dog/cat), breed, age, weight |
| `feeding_schedules` | id, pet_id, time, amount, enabled |
| `health_logs` | id, pet_id, symptoms, diagnosis, created_at |
| `dangerous_foods` | id, name, risk_level, symptoms, species |
| `guide_content` | id, category, species, title, content, step_order |
| `training_guides` | id, category, title, steps(json), difficulty |

---

## 기능별 구현 방식

| # | 기능 | 구현 방식 | 외부 API |
|---|------|-----------|---------|
| ① | 초보 보호자 가이드 | Supabase에 콘텐츠 저장 후 필터링 표시 | - |
| ② | 급식 알림·계산기 | Service Worker + Web Push, 급여량 공식 적용 | - |
| ③ | 증상 기반 건강 체크 | DB 매핑 + Claude API로 보완 | Claude API |
| ④ | 동물병원·보호소 찾기 | 카카오 로컬 API + 카카오맵 렌더링 | 카카오 API |
| ⑤ | 위험 음식 검색 | Supabase 전문 검색(pg_trgm) | - |
| ⑥ | 산책 가능 여부 | 날씨 API + 체중 기반 판단 로직 | 기상청/OWM |
| ⑦ | 훈련 가이드 | DB 콘텐츠 단계별 표시 | - |
| ⑧ | AI 병명 예측·추천 | Claude API (수의학 프롬프트 설계) | Claude API |

---

## 개발 일정 (12주)

| 주차 | 작업 내용 |
|------|-----------|
| 1주 | 프로젝트 셋업 (Next.js, Supabase 연결, Vercel 배포) |
| 2주 | 인증 (로그인·회원가입), 반려동물 등록 |
| 3~4주 | ①③⑤⑦ — 콘텐츠 기반 기능 (가이드, 건강체크, 음식, 훈련) |
| 5~6주 | ②⑥ — 급식 알림, 산책 판단 (외부 API 연동) |
| 7~8주 | ④ — 카카오맵 기반 병원·보호소 찾기 |
| 9~10주 | ⑧ — AI 기능 (Claude API 프롬프트 설계 + 응답 처리) |
| 11주 | UI/UX 개선, 반응형 마무리 |
| 12주 | 테스트, 버그 수정, 발표 자료 준비 |

---

## 시작 순서

1. `npx create-next-app@latest capstone-app` 으로 프로젝트 생성
2. Supabase 프로젝트 연결 (`@supabase/supabase-js` 설치)
3. DB 테이블 생성 (위 설계 기준)
4. 인증 페이지 구현
5. 반려동물 등록 기능 구현
6. 각 기능 페이지 순서대로 구현

---

## 미결정 사항

- **AI 방식**: Claude API(빠름, 간단) vs AWS SageMaker(커스텀 모델, 복잡) → 3개월 일정 고려 시 Claude API 우선 추천
- **날씨 API**: 기상청 API(한국어, 무료) vs OpenWeatherMap(영어, 간편) → 국내 서비스면 기상청 추천
