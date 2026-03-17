import { Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthRequest } from '../middleware/auth'

// 급식 스케줄 조회
export async function getFeedingSchedules(req: AuthRequest, res: Response) {
  const { petId } = req.params

  // 해당 반려동물이 본인 소유인지 확인
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('id')
    .eq('id', petId)
    .eq('user_id', req.userId!)
    .single()

  if (petError || !pet) {
    res.status(404).json({ error: '반려동물을 찾을 수 없습니다' })
    return
  }

  const { data, error } = await supabase
    .from('feeding_schedules')
    .select('*')
    .eq('pet_id', petId)
    .order('time', { ascending: true })

  if (error) {
    console.error('[feeding] 스케줄 조회 오류:', error)
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
}

// 급식 스케줄 등록
export async function createFeedingSchedule(req: AuthRequest, res: Response) {
  const { petId, time, amount, enabled } = req.body

  if (!petId || !time || !amount) {
    res.status(400).json({ error: 'petId, time, amount는 필수입니다' })
    return
  }

  // HH:MM 형식 검사
  if (!/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: 'time 형식은 HH:MM이어야 합니다' })
    return
  }

  // 해당 반려동물이 본인 소유인지 확인
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('id')
    .eq('id', petId)
    .eq('user_id', req.userId!)
    .single()

  if (petError || !pet) {
    res.status(404).json({ error: '반려동물을 찾을 수 없습니다' })
    return
  }

  const { data, error } = await supabase
    .from('feeding_schedules')
    .insert({ pet_id: petId, time, amount, enabled: enabled ?? true })
    .select()
    .single()

  if (error) {
    console.error('[feeding] 스케줄 등록 오류:', error)
    res.status(500).json({ error: error.message })
    return
  }

  res.status(201).json(data)
}

// 급식 스케줄 수정
export async function updateFeedingSchedule(req: AuthRequest, res: Response) {
  const { id } = req.params
  const { time, amount, enabled } = req.body

  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: 'time 형식은 HH:MM이어야 합니다' })
    return
  }

  // 스케줄이 본인 반려동물 소유인지 확인
  const { data: schedule, error: scheduleError } = await supabase
    .from('feeding_schedules')
    .select('id, pets!inner(user_id)')
    .eq('id', id)
    .single()

  if (scheduleError || !schedule) {
    res.status(404).json({ error: '스케줄을 찾을 수 없습니다' })
    return
  }

  const pet = schedule.pets as any
  if (pet.user_id !== req.userId) {
    res.status(403).json({ error: '권한이 없습니다' })
    return
  }

  const updateData: Record<string, any> = {}
  if (time !== undefined) updateData.time = time
  if (amount !== undefined) updateData.amount = amount
  if (enabled !== undefined) updateData.enabled = enabled

  const { data, error } = await supabase
    .from('feeding_schedules')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[feeding] 스케줄 수정 오류:', error)
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
}

// 급식 스케줄 삭제
export async function deleteFeedingSchedule(req: AuthRequest, res: Response) {
  const { id } = req.params

  // 스케줄이 본인 반려동물 소유인지 확인
  const { data: schedule, error: scheduleError } = await supabase
    .from('feeding_schedules')
    .select('id, pets!inner(user_id)')
    .eq('id', id)
    .single()

  if (scheduleError || !schedule) {
    res.status(404).json({ error: '스케줄을 찾을 수 없습니다' })
    return
  }

  const pet = schedule.pets as any
  if (pet.user_id !== req.userId) {
    res.status(403).json({ error: '권한이 없습니다' })
    return
  }

  const { error } = await supabase
    .from('feeding_schedules')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[feeding] 스케줄 삭제 오류:', error)
    res.status(500).json({ error: error.message })
    return
  }

  res.status(204).send()
}
