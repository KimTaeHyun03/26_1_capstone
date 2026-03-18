# Git 브랜치 전략

> Git Flow 방식 적용

---

## 브랜치 구조

```
main                    ← 배포용 (항상 안정)
develop                 ← 개발 통합
├── feature/server-core    ← 백엔드 코어 (인증·반려동물 CRUD)
├── feature/frontend-core  ← 프론트엔드 코어 (Redux, axios, 로그인·회원가입)
├── feature/pets           ← 반려동물 등록·관리
├── feature/guide          ← ① 초보 보호자 가이드
├── feature/food           ← ⑤ 위험 음식 검색
├── feature/feeding     ← ② 급식 알림·계산기
├── feature/health      ← ③ 증상 건강 체크
├── feature/map         ← ④ 동물병원·보호소 지도
├── feature/walk        ← ⑥ 산책 가능 여부
├── feature/training    ← ⑦ 훈련 가이드 (**작업 중**)
├── feature/ai          ← ⑧ 반려동물 전용 AI 챗봇 (기존 병명 예측 → 변경)
├── feature/home        ← 홈 대시보드 (반려동물 목록)
├── fix/neutered-toggle    ← 중성화 토글·종류 선택 버그 수정
├── fix/server-validation  ← 서버 측 입력 검증 추가
├── fix/token-security     ← 토큰 localStorage → HttpOnly 쿠키 변경
├── fix/weather-timeout    ← 기상청 API 타임아웃 설정
├── fix/misc-improvements  ← 6~9, 11~14번 항목 일괄 수정
├── fix/map-user-location  ← 지도 내 위치 마커 미이동 버그 수정
└── hotfix/버그명          ← 긴급 버그 수정
```

---

## 규칙

- 기능 개발은 `develop`에서 `feature/*` 브랜치 생성 후 작업
- 기능 완료 시 `feature/*` → `develop` PR 머지
- `develop` 검증 완료 후 → `main` 머지 (배포)
- 긴급 버그는 `hotfix/*` → `main` 직접 머지
- PR 머지 후 `feature/*` 브랜치 삭제 (로컬·원격 모두)

---

## 브랜치 생성 명령어

```bash
# develop에서 feature 브랜치 생성
git switch develop
git switch -c feature/기능명
git push -u origin feature/기능명
```

---

## 팀 협업 규칙

- PR 머지 시 팀원 1명 이상 리뷰 승인 필요
- 커밋 메시지는 Conventional Commits 형식 통일 (`commit_message_tip.md` 참고)
- 역할 분담은 추후 확정 후 추가 예정

---

## 브랜치 삭제 명령어

```bash
# 로컬 브랜치 삭제
git branch -d feature/기능명

# 원격 브랜치 삭제
git push origin --delete feature/기능명

# 머지 완료된 로컬 브랜치 한번에 정리
git fetch --prune
```

---

## 자주 쓰는 명령어

```bash
# 전체 브랜치 확인 (로컬 + 원격)
git branch -a

# develop 최신 내용을 내 feature 브랜치에 가져오기 (충돌 예방)
# 1. 원격 저장소의 develop 최신 내용을 로컬로 다운로드
git switch develop
git pull                  # git fetch(다운로드) + git merge(로컬 반영) 합친 명령어

# 2. 내 feature 브랜치에 develop 내용 반영
git switch feature/기능명
git merge develop

# 또는 rebase 방식 (커밋 히스토리 직선으로 정리)
git rebase develop

# 충돌 해결 후
git add .
git commit
git push
```

---

## merge vs rebase

| | merge | rebase |
|--|-------|--------|
| 히스토리 | 분기가 그대로 보임 | 히스토리가 직선으로 정리됨 |
| 충돌 해결 | 한 번 | 커밋마다 |
| 사용 시점 | PR 머지 시 | 로컬에서 develop 최신 내용 따라갈 때 |
