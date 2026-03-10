# Conventional Commits 작성 가이드

## 기본 형식

```
<type>(<scope>): <subject>

<body>
```

- `<scope>`: 선택사항. 어떤 부분을 수정했는지 범위 표시 (예: `feat(auth):`, `fix(map):`)
- `<body>`: 선택사항. 변경 이유나 상세 설명

---

## Type 종류

| type | 용도 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: add pet registration form` |
| `fix` | 버그 수정 | `fix: resolve login redirect issue` |
| `docs` | 문서 추가·수정 | `docs: add API usage guide` |
| `style` | 코드 포맷·스타일 변경 (기능 변경 없음) | `style: format with prettier` |
| `refactor` | 리팩토링 (기능 변경 없음) | `refactor: simplify auth middleware` |
| `test` | 테스트 코드 추가·수정 | `test: add unit tests for feeding calculator` |
| `chore` | 빌드 설정, 패키지, 환경 등 기타 | `chore: add dotenv and cors packages` |
| `perf` | 성능 개선 | `perf: optimize pet list query` |

---

## Subject 작성 규칙

- 영어 소문자로 시작
- 동사 원형으로 시작 (add, fix, update, remove, refactor ...)
- 끝에 마침표(.) 붙이지 않음
- 50자 이내 권장

---

## 예시

### 기능 추가
```
feat(auth): add social login with kakao

- Implement Kakao OAuth2 flow
- Store access token in Supabase Auth
```

### 버그 수정
```
fix(feeding): correct daily amount calculation for cats

Weight-based formula was using dog formula for cats.
```

### 문서
```
docs: add project research report

- Analyze tech stack (React+TS, Node.js, Supabase, Gemini API)
- Define DB schema and table relationships
- Outline 12-week development schedule with progress tracking
- Document API key security management strategy
- Specify library choices (axios, Redux Toolkit, React Query, etc.)
```

### 환경 설정
```
chore: set up project structure with client and server

- Initialize React+TS frontend with Vite
- Initialize Node.js+Express backend
- Configure .gitignore for .env files
```

---

## 포트폴리오에서 좋아 보이는 이유

- 커밋 히스토리만 봐도 어떤 작업을 했는지 한눈에 파악 가능
- 실무에서 널리 쓰이는 컨벤션이라 협업 경험을 어필할 수 있음
- GitHub Actions, 자동 changelog 생성 등과 연계 가능
