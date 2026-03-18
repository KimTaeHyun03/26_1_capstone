import { test, expect } from '@playwright/test';

const WAIT = 2000;
const BASE = 'http://localhost:5173';

test('#21 Login 오류 메시지 구분', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(WAIT);

  // 잘못된 비밀번호 → 401
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await page.waitForSelector('p.text-red-500', { timeout: 8000 });
  const errMsg = await page.locator('p.text-red-500').last().textContent();
  console.log(`401 오류 메시지: "${errMsg}"`);
  console.log(errMsg?.includes('이메일 또는 비밀번호') ? '✅ 인증 실패 메시지 정상' : '❌ 메시지 오류');
  await page.waitForTimeout(WAIT);

  // 네트워크 오류 시뮬레이션
  await page.route('**/api/auth/login', (route) => route.abort('connectionrefused'));
  await page.fill('input[type="password"]', 'test1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(WAIT);
  const networkErrMsg = await page.locator('p.text-red-500').last().textContent();
  console.log(`네트워크 오류 메시지: "${networkErrMsg}"`);
  console.log(networkErrMsg?.includes('네트워크') ? '✅ 네트워크 오류 메시지 정상' : '❌ 메시지 오류');
  await page.unroute('**/api/auth/login');
  await page.waitForTimeout(WAIT);
});

test('#19 #20 Health·Training UI 확인', async ({ page }) => {
  // 로그인
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'test1234');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 8000 });
  await page.waitForTimeout(WAIT);
  console.log('✅ 로그인 성공');

  // #20 Training 배너 확인
  await page.goto(`${BASE}/training`);
  await page.waitForTimeout(WAIT);
  const bannerVisible = await page.locator('text=강아지 전용 콘텐츠').isVisible();
  console.log(bannerVisible ? '✅ Training 강아지 전용 배너 표시됨' : '❌ 배너 없음');
  await page.waitForTimeout(WAIT);

  // 테스트용 반려동물 등록
  await page.goto(`${BASE}/pets/new`);
  await page.waitForTimeout(WAIT);
  await page.fill('input[placeholder="반려동물 이름"]', '테스트멍이');
  await page.fill('input[type="date"]', '2021-03-01');
  await page.fill('input[type="number"]', '5.0');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 8000 });
  await page.waitForTimeout(WAIT);
  console.log('✅ 테스트 반려동물 등록');

  // #19 Health 스피너 확인
  await page.goto(`${BASE}/health`);
  await page.waitForTimeout(WAIT);

  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  if (count > 0) {
    await checkboxes.first().check();
    await page.waitForTimeout(WAIT);

    // API 응답 지연으로 스피너 노출
    await page.route('**/api/health/analyze', async (route) => {
      await new Promise((r) => setTimeout(r, 2500));
      await route.continue();
    });

    const analyzeBtn = page.locator('button:has-text("AI 분석 요청")');
    if (await analyzeBtn.isVisible()) {
      await analyzeBtn.click();
      await page.waitForTimeout(600);
      const spinnerVisible = await page.locator('svg.animate-spin').isVisible();
      console.log(spinnerVisible ? '✅ Health 로딩 스피너 표시됨' : '❌ 스피너 없음');
      await page.waitForTimeout(WAIT);
    }
    await page.unroute('**/api/health/analyze');
  }

  // 테스트 데이터 정리
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(WAIT);
  const petCard = page.locator('text=테스트멍이').first();
  if (await petCard.isVisible()) {
    await petCard.click();
    await page.waitForTimeout(WAIT);
    page.once('dialog', (d) => d.accept());
    await page.locator('button:has-text("삭제하기")').click();
    await page.waitForURL(`${BASE}/`, { timeout: 5000 });
    console.log('✅ 테스트 데이터 정리 완료');
  }
});
