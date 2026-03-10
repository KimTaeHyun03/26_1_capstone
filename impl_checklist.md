# 구현 전 체크리스트

> research.md 기준으로 구현 시작 전 보완이 필요한 항목들
> 순서대로 해결 후 research.md에 반영

---

## 🔴 우선순위 높음 (없으면 구현 불가)

### 1. 급여량 계산 공식 정의
- [x] 강아지 급여량 공식 (나이·체중·활동량 기반)
- [x] 고양이 급여량 공식 (나이·체중 기반)
- [x] 공식 출처 명시 (수의사 권장, 사료 제조사 기준 등)

---

### 2. 산책 가능 여부 판단 기준 정의
- [x] 기온 기준 (추위: 체중별 3단계, 더위: 전 견종 공통)
- [x] 강수량·날씨 상태 기준 (비, 눈, 천둥번개 → 주의)
- [x] 체중별 기준 차이 여부 (소형견/중형견/대형견 3단계 구분)
- [x] 강아지/고양이 구분 여부 (고양이 산책 기능 제외, 앱 내 명시)

---

### 3. 정적 콘텐츠 데이터 입력 방법 결정
> `guide_content`, `dangerous_foods`, `training_guides` 테이블에 넣을 데이터가 없으면 ①⑤⑦ 기능이 동작하지 않음

- [x] 데이터 입력 방식 결정 → SQL 파일로 직접 작성 후 Supabase에 import 확정
- [x] 데이터 수집 방법 결정
  - `dangerous_foods` → ASPCA 자료 보고 직접 SQL 입력 (data_sources.md 참고) ✅ 완료
  - `guide_content` → Gemini로 초안 생성 후 검토·수정 ❌ 미완료
  - `training_guides` → Gemini로 초안 생성 후 검토·수정 ❌ 미완료
- [x] 최소 초기 데이터 분량 산정 (기능 테스트 가능한 수준)
  - `dangerous_foods` → 9개 (ASPCA 기반, 이미 확보)
  - `guide_content` → 6개 (강아지 3개 + 고양이 3개 / 기초준비·식사·건강관리)
  - `training_guides` → 3개 (강아지 기준 / 앉아·기다려·이리와)

---

## 🟡 우선순위 중간 (개발 시작 전 정의 권장)

### 4. API 엔드포인트 설계
> 프론트-백 연동 시 혼선 방지를 위해 미리 정의

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
| GET | `/api/guide?species=` | 보호자 가이드 조회 |
| GET | `/api/training?species=` | 훈련 가이드 조회 |
| GET | `/api/map/hospitals?lat=&lng=` | 주변 동물병원 검색 |
| GET | `/api/map/shelters?lat=&lng=` | 주변 보호소 검색 |
| GET | `/api/walk?petId=&lat=&lng=` | 산책 가능 여부 판단 |
| POST | `/api/ai/diagnosis` | AI 병명 예측 |

- [x] 엔드포인트 검토 및 확정
- [x] 누락된 엔드포인트 추가

---

### 5. React Router URL 경로 설계

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

- [x] URL 경로 검토 및 확정
- [x] 인증 필요한 페이지 구분 (로그인 없이 접근 가능 vs 불가)

---

### 6. 환경 변수 키 이름 목록 정의

**client/.env.example**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=
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
```

- [x] 키 이름 확정
- [x] 누락된 환경 변수 추가
- [ ] 실제 값 입력 → 구현 시작 전 별도 추가 예정

---

### 7. Supabase RLS 정책 설계
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

- [x] RLS 정책 검토 및 확정

---

## 🔵 구현 전 추가 확정 필요

### 8. DB 설계 보완

- [x] `pets` 테이블에 `neutered boolean` 컬럼 추가 (급여량 계산에 필요)
- [x] `pets` 테이블 나이 저장 방식 결정 → `birth_date` 저장 후 date-fns로 자동 계산
- [x] `users` 테이블 설계 결정 → `public.users` 별도 생성, 회원가입 시 서버에서 두 테이블 동시 생성

---

### 9. 환경변수 보완

- [x] VAPID 키 추가 (Web Push 급식 알림에 필요) → `server/.env.example`에 추가 필요
  - `VAPID_PUBLIC_KEY=`
  - `VAPID_PRIVATE_KEY=`
- [x] 푸시 알림 방식 확정 → PWA (Android 완전 지원, iOS 16.4+ 홈화면 추가 시 지원)

---

### 10. 미확보 데이터

- [ ] `guide_content` 데이터 생성 (Gemini API 키 발급 후 초안 생성)
- [ ] `training_guides` 데이터 생성 (Gemini API 키 발급 후 초안 생성)
