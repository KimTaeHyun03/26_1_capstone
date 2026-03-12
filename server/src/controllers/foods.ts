import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// 위험 음식 검색 (pg_trgm 전문 검색)
export async function searchFoods(req: Request, res: Response) {
  const { q, species } = req.query

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    res.status(400).json({ error: '검색어를 입력해주세요' })
    return
  }

  let query = supabase
    .from('dangerous_foods')
    .select('*')
    .ilike('name', `%${q.trim()}%`)
    .order('risk_level')

  if (species === 'dog' || species === 'cat') {
    query = query.in('species', [species, 'both'])
  }

  const { data, error } = await query

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
}
