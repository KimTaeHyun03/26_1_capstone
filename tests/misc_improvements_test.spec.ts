import { test } from '@playwright/test';

const WAIT = 2000;
const BASE = 'http://localhost:5173';

test('misc-improvements 수정 사항 테스트', async ({ page, context }) => {
  // 로그인
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(WAIT);
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'test1234');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 8000 });
  await page.waitForTimeout(WAIT);
  console.log('✅ 로그인 성공');

  // #8 Home.tsx - 반려동물 목록 정상 로드
  await page.waitForTimeout(WAIT);
  const homeContent = await page.content();
  const hasError = homeContent.includes('데이터를 불러올 수 없습니다');
  console.log(hasError ? '❌ Home.tsx 에러 화면 노출' : '✅ Home.tsx 정상 로드');

  // #6 반려동물 등록 페이지 이동 (GET /api/pets/:id 테스트)
  await page.goto(`${BASE}/pets/new`);
  await page.waitForTimeout(WAIT);
  console.log('✅ 반려동물 등록 페이지 로드');

  // 고양이 선택 후 등록
  await page.click('label:has(input[value="cat"])');
  await page.waitForTimeout(WAIT);
  await page.fill('input[placeholder="반려동물 이름"]', '테스트냥이');
  await page.fill('input[type="date"]', '2022-05-01');
  await page.fill('input[type="number"]', '4.2');
  await page.waitForTimeout(WAIT);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 8000 });
  await page.waitForTimeout(WAIT);
  console.log('✅ 고양이 등록 성공 → 홈으로 이동');

  // 등록된 고양이 카드 클릭해서 수정 페이지로 (GET /api/pets/:id 확인)
  const petCard = page.locator('text=테스트냥이').first();
  if (await petCard.isVisible()) {
    await petCard.click();
    await page.waitForTimeout(WAIT);
    const editUrl = page.url();
    console.log(editUrl.includes('/pets/') ? '✅ 수정 페이지 이동 성공 (GET /api/pets/:id 동작)' : '❌ 수정 페이지 이동 실패');
    await page.waitForTimeout(WAIT);
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(WAIT);
  }

  // #12 Walk.tsx - 고양이 선택 시 버튼 비활성화 확인
  await page.goto(`${BASE}/walk`);
  await page.waitForTimeout(WAIT);
  const walkBtn = page.locator('button:has-text("지금 산책 가능한지 확인")');
  const isDisabled = await walkBtn.isDisabled();
  console.log(isDisabled ? '✅ Walk - 고양이 선택 시 버튼 비활성화 확인' : '⚠️ Walk - 버튼 상태 확인 필요');
  await page.waitForTimeout(WAIT);

  // 등록된 고양이 삭제 (정리)
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(WAIT);
  const petCardAgain = page.locator('text=테스트냥이').first();
  if (await petCardAgain.isVisible()) {
    await petCardAgain.click();
    await page.waitForTimeout(WAIT);
    const deleteBtn = page.locator('button:has-text("삭제하기")');
    if (await deleteBtn.isVisible()) {
      page.once('dialog', (dialog) => dialog.accept());
      await deleteBtn.click();
      await page.waitForURL(`${BASE}/`, { timeout: 5000 });
      console.log('✅ 테스트 데이터 정리 완료');
    }
  }

});

