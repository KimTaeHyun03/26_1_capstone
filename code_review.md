# 코드 리뷰 보고서

> 작성일: 2026-03-18
> 분석 범위: client/src, server/src 전체
> 심각도: 🔴 심각 / 🟠 높음 / 🟡 중간 / 🟢 낮음

---

## 즉시 수정 필요 🔴

### 1. 서버 측 입력 검증 부재
**브랜치**: `fix/server-validation`
**라이브러리**: `express-validator`

| 파일 | 검증 항목 |
|------|----------|
| `server/src/controllers/auth.ts` | 이메일 형식, 비밀번호 8자 이상, 닉네임 길이 |
| `server/src/controllers/pets.ts` | 이름 필수, species(dog/cat만), 체중 양수, 생년월일 형식 |
| `server/src/controllers/feeding.ts` | time HH:MM 형식, amount 양수 |
| `server/src/controllers/health.ts` | petId 필수, symptoms 배열 |
| `server/src/controllers/walk.ts` | lat/lng 숫자·범위, petId 필수 |
| `server/src/controllers/map.ts` | lat/lng 숫자, NaN 방지 |

```ts
// 현재: 검증 없이 바로 DB 저장
const { email, password, nickname } = req.body
await supabase.auth.admin.createUser({ email, password })

// 개선: express-validator로 검증
body('email').isEmail(),
body('password').isLength({ min: 8 }),
body('weight').isFloat({ gt: 0 })
```

### 2. 토큰을 localStorage에 저장 (보안 취약)
**브랜치**: `fix/token-security`

| 위치 | 변경 사항 |
|------|----------|
| `server/package.json` | `cookie-parser` 설치 |
| `server/src/index.ts` | CORS `credentials: true`, cookie-parser 미들웨어 등록 |
| `server/src/controllers/auth.ts` | 로그인 시 HttpOnly 쿠키로 토큰 전달, 로그아웃 시 쿠키 삭제 |
| `server/src/middleware/auth.ts` | Authorization 헤더 대신 쿠키에서 토큰 읽기 |
| `client/src/lib/axios.ts` | localStorage 제거, `withCredentials: true` 추가 |
| `client/src/pages/auth/Login.tsx` | localStorage.setItem 제거 |
| `client/src/pages/auth/Register.tsx` | localStorage 관련 코드 제거 확인 |

### 3. Gemini API Rate Limiting 없음
**파일**: `server/src/controllers/foods.ts`, `health.ts`

악의적 사용자가 API를 반복 호출하면 Gemini 무료 할당량(일 1,500 req) 소진 가능.

```ts
// 개선: express-rate-limit 추가
import rateLimit from 'express-rate-limit'
const geminiLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 })
router.post('/chat', geminiLimiter, chatController)
```

### 4. 기상청 API 타임아웃 미설정
**브랜치**: `fix/weather-timeout` ✅

- `timeout: 5000` 추가 (5초 초과 시 에러)
- `obsrValue` NaN 방지 (`isNaN` 체크 추가)

---

## 높은 우선순위 🟠

### 5. watch() 호출 순서 버그 (이미 수정 완료)
**파일**: `client/src/pages/Pets.tsx`

`watch()`를 `useForm()` 선언 이전에 호출하여 런타임 오류 발생 → 수정 완료.

### 6. Pets 수정 시 전체 목록 조회 후 클라이언트 필터링
**파일**: `client/src/pages/Pets.tsx:38`

반려동물이 많을수록 성능 저하. `GET /api/pets/:id` 엔드포인트가 없어 전체를 가져와서 찾음.

```ts
// 현재
const res = await api.get('/api/pets')
return res.data.find((p: Pet) => p.id === petId)

// 개선: 서버에 GET /api/pets/:id 엔드포인트 추가
const res = await api.get(`/api/pets/${petId}`)
return res.data
```

### 7. Feeding.tsx 구독 API 호출 예외 처리 누락
**파일**: `client/src/pages/Feeding.tsx:171`

API 저장 실패 시에도 "구독 완료"로 표시됨.

```ts
// 현재: try-catch 없음
await api.post('/api/push/subscribe', { ... })
setNotificationStatus('subscribed')

// 개선
try {
  await api.post('/api/push/subscribe', { ... })
  setNotificationStatus('subscribed')
} catch {
  setNotificationStatus('error')
}
```

### 8. Home.tsx API 오류 상태 미처리
**파일**: `client/src/pages/Home.tsx:28`

반려동물 조회 실패 시 에러 화면 없음. "불러오는 중..." 상태가 고정될 수 있음.

```ts
// 개선
const { data: pets = [], isLoading, isError } = useQuery(...)
if (isError) return <div>데이터를 불러올 수 없습니다</div>
```

### 9. 환경 변수 누락 시 조용히 실패
**파일**: `server/src/lib/supabase.ts:6`

`.env` 누락 시 `undefined!`로 Supabase 초기화 → 런타임에서야 오류 발견.

```ts
// 개선: 서버 시작 시 검증
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'GEMINI_API_KEY']
required.forEach(key => {
  if (!process.env[key]) throw new Error(`환경변수 누락: ${key}`)
})
```

### 10. AiDiagnosis 페이지 미구현
**파일**: `client/src/pages/AiDiagnosis.tsx`

라우트에 연결되어 있지만 빈 페이지. 사용자가 접근하면 빈 화면.

---

## 중간 우선순위 🟡

### 11. Map.tsx useCallback 의존성 누락
**파일**: `client/src/pages/Map.tsx:128`

`activeTab`이 의존성 배열에 빠져 있어 클로저 버그 가능.

```ts
// 현재
}, [mapReady, showMarkers])

// 개선
}, [mapReady, showMarkers, activeTab])
```

### 12. Walk.tsx 고양이 선택 시 버튼 미비활성화
**파일**: `client/src/pages/Walk.tsx:131`

고양이를 선택해도 "산책 확인" 버튼 클릭 가능. 클릭 후에만 경고 메시지 표시.

```tsx
// 개선: 고양이 선택 시 버튼 비활성화 또는 선택 항목에서 제외
<button disabled={selectedPet?.species === 'cat'}>산책 확인</button>
```

### 13. Map.tsx 마커 대량 생성 시 성능 저하
**파일**: `client/src/pages/Map.tsx:90`

검색 결과 100개면 마커 100개를 매번 재생성. 모바일에서 렌더링 지연.

- **개선**: 마커 클러스터링 라이브러리 적용 또는 최대 표시 개수 제한

### 14. React Query staleTime 미설정
**파일**: `client/src/pages/Food.tsx:31`, `Guide.tsx`, `Training.tsx`

staleTime 없으면 컴포넌트 포커스 시마다 재요청. 정적 콘텐츠(가이드, 훈련)는 캐시 활용 가능.

```ts
// 개선
useQuery({
  queryKey: ['guide'],
  queryFn: fetchGuide,
  staleTime: 1000 * 60 * 10, // 10분
})
```

### 15. 기상청 API obsrValue NaN 가능
**파일**: `server/src/lib/weather.ts:83`

```ts
// 현재
return item ? parseFloat(item.obsrValue) : 0

// 개선
const val = parseFloat(item.obsrValue)
return isNaN(val) ? 0 : val
```

### 16. Feeding.tsx amount 입력값 NaN 가능
**파일**: `client/src/pages/Feeding.tsx:77`

`newAmount`가 문자열이라 `Number("abc")` = NaN 가능.

```ts
// 개선: 숫자만 입력 허용
<input type="number" min="0" ... />
```

### 17. CORS 기본값 위험
**파일**: `server/src/index.ts:24`

`CLIENT_URL` 누락 시 localhost만 허용이지만, 배포 환경에서 누락되면 예상치 못한 동작.

```ts
// 개선: 환경변수 없으면 서버 시작 중단
const origin = process.env.CLIENT_URL
if (!origin) throw new Error('CLIENT_URL 환경변수 누락')
app.use(cors({ origin }))
```

### 18. 민감정보 프로덕션 로그 출력
**파일**: `server/src/lib/cron.ts:34`

`console.log`로 사용자 관련 정보가 프로덕션 로그에 노출될 수 있음.

- **개선**: `NODE_ENV === 'development'` 조건부 로깅 또는 pino/winston 도입

---

## 낮은 우선순위 🟢

### 19. Health.tsx 로딩 스피너 없음
**파일**: `client/src/pages/Health.tsx:134`

Gemini 분석 중 텍스트("AI 분석 중...")만 있고 시각적 피드백 없음. 스피너 추가 권장.

### 20. Training.tsx 강아지 전용 안내 눈에 잘 안 띔
**파일**: `client/src/pages/Training.tsx:51`

안내 문구가 작아 고양이 보호자가 놓칠 수 있음. 더 눈에 띄는 배너로 변경 권장.

### 21. Login.tsx 모든 오류에 동일한 메시지
**파일**: `client/src/pages/auth/Login.tsx:33`

네트워크 오류, 서버 오류 등 구분 없이 "이메일 또는 비밀번호가 올바르지 않습니다" 표시.

---

## 수정 완료 ✅

| 항목 | 파일 | 브랜치 |
|------|------|--------|
| 중성화 토글 동그라미 미이동 | `Pets.tsx` | `fix/neutered-toggle` |
| 종류 선택 버튼 선택 상태 미표시 | `Pets.tsx` | `fix/neutered-toggle` |
| watch() useForm 이전 호출로 빈 화면 | `Pets.tsx` | `fix/neutered-toggle` |
| zod v4 resolver 타입 오류 | `package.json` | `main` |
| 서버 측 입력 검증 (#1) | `controllers/auth.ts`, `pets.ts`, `feeding.ts`, `health.ts`, `walk.ts`, `map.ts` | `fix/server-validation` |
| 토큰 localStorage → HttpOnly 쿠키 (#2) | `auth.ts`, `axios.ts`, `auth.ts(middleware)` | `fix/token-security` |
| 기상청 API 타임아웃·NaN 방지 (#4) | `weather.ts` | `fix/weather-timeout` |
| GET /api/pets/:id 엔드포인트 추가 (#6) | `routes/pets.ts`, `Pets.tsx` | `fix/misc-improvements` |
| Feeding 구독 예외 처리 (#7) | `Feeding.tsx` | `fix/misc-improvements` |
| Home.tsx isError 상태 처리 (#8) | `Home.tsx` | `fix/misc-improvements` |
| 환경 변수 시작 시 검증 (#9) | `server/src/index.ts` | `fix/misc-improvements` |
| Map.tsx useCallback activeTab 의존성 누락 (#11) | `Map.tsx` | `fix/misc-improvements` |
| Walk.tsx 고양이 버튼 비활성화 (#12) | `Walk.tsx` | `fix/misc-improvements` |
| React Query staleTime 추가 (#13) | `Guide.tsx`, `Training.tsx`, `Food.tsx` | `fix/misc-improvements` |
| Map.tsx 마커 최대 30개 제한 (#13-마커) | `Map.tsx` | `fix/misc-improvements` |
| Feeding amount 입력 min="1" 추가 (#16) | `Feeding.tsx` | `fix/misc-improvements` |
| CORS CLIENT_URL 프로덕션 검증 (#17) | `server/src/index.ts` | `fix/misc-improvements` |
| cron.ts 개발 환경에서만 로그 출력 (#18) | `server/src/lib/cron.ts` | `fix/misc-improvements` |
| Health.tsx AI 분석 중 로딩 스피너 추가 (#19) | `Health.tsx` | `fix/misc-improvements` |
| Training.tsx 강아지 전용 안내 배너 강조 (#20) | `Training.tsx` | `fix/misc-improvements` |
| Login.tsx 오류 메시지 상황별 구분 (#21) | `Login.tsx` | `fix/misc-improvements` |

---

## 우선순위 요약

| 순위 | 항목 | 난이도 |
|------|------|--------|
| 1 | 서버 측 입력 검증 | 중 |
| 2 | Gemini Rate Limiting | 하 |
| 3 | 기상청 API 타임아웃 | 하 |
| 4 | Feeding 구독 예외 처리 | 하 |
| 5 | GET /api/pets/:id 추가 | 하 |
| 6 | Home.tsx 에러 상태 처리 | 하 |
| 7 | AiDiagnosis 구현 | 상 |
| 8 | Map.tsx 의존성 수정 | 하 |
| 9 | Walk 고양이 버튼 비활성화 | 하 |
| 10 | 환경 변수 시작 시 검증 | 하 |
