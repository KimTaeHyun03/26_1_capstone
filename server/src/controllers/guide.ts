import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// 가이드 목록 조회 (species 필터)
export async function getGuide(req: Request, res: Response) {
  const { species } = req.query

  if (!species || (species !== 'dog' && species !== 'cat')) {
    res.status(400).json({ error: 'species 파라미터는 dog 또는 cat이어야 합니다' })
    return
  }

  const { data, error } = await supabase
    .from('guide_content')
    .select('*')
    .eq('species', species)
    .order('category')
    .order('step_order')

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
}
