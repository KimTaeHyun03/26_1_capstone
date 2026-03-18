import cron from 'node-cron'
import webpush from 'web-push'
import { supabase } from './supabase'

// VAPID 키 설정
webpush.setVapidDetails(
  'mailto:admin@petmanagement.app',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// 매분 실행: 현재 시각과 일치하는 급식 스케줄 조회 후 푸시 발송
export function startFeedingCron() {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${hh}:${mm}`

    // 현재 시각과 일치하고 enabled인 스케줄 조회
    const { data: schedules, error } = await supabase
      .from('feeding_schedules')
      .select('id, amount, time, pets!inner(id, name, user_id)')
      .eq('time', currentTime)
      .eq('enabled', true)

    if (error) {
      console.error('[cron] 스케줄 조회 오류:', error)
      return
    }

    if (!schedules || schedules.length === 0) return

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[cron] ${currentTime} 급식 알림 대상: ${schedules.length}건`)
    }

    for (const schedule of schedules) {
      const pet = schedule.pets as any
      const userId = pet.user_id

      // 해당 유저의 푸시 구독 정보 조회
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId)

      if (subError || !subscriptions || subscriptions.length === 0) continue

      const payload = JSON.stringify({
        title: `🍽️ ${pet.name} 급식 시간`,
        body: `${schedule.time} — 권장 급여량 ${schedule.amount}g`,
      })

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
        } catch (err: any) {
          // 만료된 구독은 DB에서 삭제
          if (err.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
            if (process.env.NODE_ENV !== 'production') {
              console.log('[cron] 만료된 구독 삭제:', sub.endpoint)
            }
          } else {
            console.error('[cron] 푸시 발송 오류:', err?.message)
          }
        }
      }
    }
  })

  console.log('[cron] 급식 알림 스케줄러 시작됨')
}
