import { Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthRequest } from '../middleware/auth'

// 내 반려동물 목록 조회
export async function getPets(req: AuthRequest, res: Response) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: true })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
}

// 반려동물 단일 조회
export async function getPet(req: AuthRequest, res: Response) {
  const { id } = req.params

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.userId!)
    .single()

  if (error || !data) {
    res.status(404).json({ error: '반려동물을 찾을 수 없습니다' })
    return
  }

  res.json(data)
}

// 반려동물 등록
export async function createPet(req: AuthRequest, res: Response) {
  const { name, species, breed, birth_date, weight, neutered } = req.body

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: '이름을 입력해주세요' })
    return
  }
  if (!['dog', 'cat'].includes(species)) {
    res.status(400).json({ error: 'species는 dog 또는 cat이어야 합니다' })
    return
  }
  if (!birth_date || !/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) {
    res.status(400).json({ error: '생년월일 형식은 YYYY-MM-DD이어야 합니다' })
    return
  }
  if (!weight || weight <= 0) {
    res.status(400).json({ error: '체중은 0보다 커야 합니다' })
    return
  }

  const { data, error } = await supabase
    .from('pets')
    .insert({ user_id: req.userId!, name, species, breed, birth_date, weight, neutered })
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(201).json(data)
}

// 반려동물 정보 수정
export async function updatePet(req: AuthRequest, res: Response) {
  const { id } = req.params
  const { name, species, breed, birth_date, weight, neutered } = req.body

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: '이름을 입력해주세요' })
    return
  }
  if (!['dog', 'cat'].includes(species)) {
    res.status(400).json({ error: 'species는 dog 또는 cat이어야 합니다' })
    return
  }
  if (!birth_date || !/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) {
    res.status(400).json({ error: '생년월일 형식은 YYYY-MM-DD이어야 합니다' })
    return
  }
  if (!weight || weight <= 0) {
    res.status(400).json({ error: '체중은 0보다 커야 합니다' })
    return
  }

  const { data, error } = await supabase
    .from('pets')
    .update({ name, species, breed, birth_date, weight, neutered, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', req.userId!)
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  if (!data) {
    res.status(404).json({ error: '반려동물을 찾을 수 없습니다' })
    return
  }

  res.json(data)
}

// 반려동물 삭제
export async function deletePet(req: AuthRequest, res: Response) {
  const { id } = req.params

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)
    .eq('user_id', req.userId!)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(204).send()
}
