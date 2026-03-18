# 데이터 출처 및 수집 자료

> AI 학습 및 DB 초기 데이터 입력 시 활용할 출처 모음

---

## 1. 위험 음식 (dangerous_foods)

**출처**: ASPCA Animal Poison Control — People Foods to Avoid Feeding Your Pets
**URL**: https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets

| 음식 | 위험도 | 증상 | 비고 |
|------|--------|------|------|
| 알코올 및 효모 반죽 | 매우 높음 | 구토, 설사, 운동 실조, 호흡 곤란, 경련, 혼수상태, 사망 | |
| 초콜릿, 커피, 카페인 | 높음 | 구토, 설사, 헐떡임, 과다 갈증/배뇨, 과잉행동, 비정상 심박동, 경련, 사망 | 카카오 함량 높을수록 위험 |
| 포도 및 건포도 | 높음 | 신장 손상 | |
| 양파, 마늘, 부추 | 중간~높음 | 소화기계 자극, 적혈구 손상, 빈혈 | 고양이가 더 민감 |
| 자일리톨 | 매우 높음 | 저혈당증, 간 손상, 구토, 무기력, 조정 능력 상실, 경련 | 무설탕 껌 등에 포함 |
| 마카다미아 견과류 | 높음 | 약화, 운동 실조, 구토, 경련, 고체온증 | |
| 기타 견과류 | 중간 | 구토, 설사, 췌장염 | |
| 날것·덜 익은 고기/계란, 뼈 | 중간~높음 | 박테리아 감염, 위장 손상/폐쇄 | |
| 과도한 염분 | 높음 | 구토, 설사, 경련, 사망 | |

**응급 연락처**: ASPCA Poison Control — (888) 426-4435

---

## 2. 급여량 계산 공식 근거

**출처 1**: WSAVA 글로벌 영양평가 가이드라인 (한국동물병원협회 번역본)
**URL**: https://wsava.org/global-guidelines/global-nutrition-guidelines/

**출처 2**: National Research Council. *Nutrient Requirements of Dogs and Cats*. National Academies Press, 2006.
(단행본, URL 없음 — WSAVA 가이드라인 참고자료 4번)

---

## 3. 산책 가능 여부 판단 기준 근거

**출처 1**: PetMD — *How Cold Is Too Cold for Your Dog?*
**URL**: https://www.petmd.com/dog/care/how-cold-too-cold-dog

**출처 2**: GoodRx — *What Temperature Is Too Hot or Too Cold to Walk Your Dog?*
**URL**: https://www.goodrx.com/pet-health/dog/what-temperature-too-hot-for-dogs-to-walk

---

## 4. 미수집 데이터 (추후 Gemini로 초안 생성 예정)

| 테이블 | 내용 | 상태 |
|--------|------|------|
| `guide_content` | 초보 보호자 가이드 콘텐츠 | 미수집 |
| `training_guides` | 훈련 가이드 단계별 콘텐츠 | 미수집 |
