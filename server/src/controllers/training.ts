import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// 훈련 가이드 조회 (category 필터)
export async function getTraining(req: Request, res: Response) {
  const { category } = req.query

  let query = supabase
    .from('training_guides')
    .select('*')
    .order('difficulty')

  if (category && typeof category === 'string') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('[training] 훈련 가이드 조회 오류:', error)
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
}
