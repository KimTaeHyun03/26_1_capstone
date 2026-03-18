import { test } from '@playwright/test';

const WAIT = 2500;

test('토큰 보안 테스트', async ({ page, context }) => {
  // 1. 로그인 페이지 이동
  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(WAIT);

  await page.fill('input[type="email"]', 'test@test.com');
  await page.waitForTimeout(WAIT);

  await page.fill('input[type="password"]', 'test1234');
  await page.waitForTimeout(WAIT);

  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/', { timeout: 8000 });
  await page.waitForTimeout(WAIT);
  console.log('✅ 로그인 성공');

  // 2. 쿠키 확인
  const cookies = await context.cookies();
  const tokenCookie = cookies.find(c => c.name === 'access_token');
  if (tokenCookie) {
    console.log(`✅ access_token 쿠키 존재 | httpOnly: ${tokenCookie.httpOnly} | secure: ${tokenCookie.secure}`);
  } else {
    console.log('❌ access_token 쿠키 없음');
  }
  await page.waitForTimeout(WAIT);

  // 3. localStorage 확인
  const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
  const authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  console.log(accessToken ? '❌ access_token이 localStorage에 존재!' : '✅ access_token localStorage에 없음');
  console.log(authUser ? `✅ auth_user 존재: ${authUser}` : '❌ auth_user 없음');
  await page.waitForTimeout(WAIT);

  // 4. 새로고침 후 로그인 유지
  await page.reload();
  await page.waitForTimeout(WAIT);
  const url = page.url();
  console.log(url.includes('/login') ? '❌ 새로고침 후 로그인 해제' : '✅ 새로고침 후 로그인 유지');
  await page.waitForTimeout(WAIT);

  // 5. 로그아웃 후 쿠키 삭제 확인
  await page.evaluate(async () => {
    await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
  });
  await page.waitForTimeout(WAIT);

  const cookiesAfter = await context.cookies();
  const tokenAfter = cookiesAfter.find(c => c.name === 'access_token');
  console.log(tokenAfter ? '❌ 로그아웃 후 쿠키 남아있음' : '✅ 로그아웃 후 쿠키 삭제됨');

  await page.waitForTimeout(2000);
});
