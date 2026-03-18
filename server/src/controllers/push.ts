import { Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthRequest } from '../middleware/auth'

// 푸시 구독 등록
export async function subscribe(req: AuthRequest, res: Response) {
  const { endpoint, p256dh, auth } = req.body

  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({ error: 'endpoint, p256dh, auth는 필수입니다' })
    return
  }

  // 이미 동일 endpoint로 구독된 경우 업데이트, 없으면 삽입
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: req.userId!, endpoint, p256dh, auth },
      { onConflict: 'endpoint' }
    )

  if (error) {
    console.error('[push] 구독 등록 오류:', error)
    res.status(500).json({ error: error.message })
    return
  }

  console.log(`[push] 구독 등록 완료 - user: ${req.userId}`)
  res.status(201).json({ message: '푸시 알림 구독이 완료되었습니다' })
}

// 푸시 구독 취소
export async function unsubscribe(req: AuthRequest, res: Response) {
  const { endpoint } = req.body

  if (!endpoint) {
    res.status(400).json({ error: 'endpoint는 필수입니다' })
    return
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', req.userId!)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('[push] 구독 취소 오류:', error)
    res.status(500).json({ error: error.message })
    return
  }

  console.log(`[push] 구독 취소 완료 - user: ${req.userId}`)
  res.status(204).send()
}
