import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

// AI 음식 안전성 문의 (Gemini)
export async function chatFoods(req: Request, res: Response) {
  const { food, species } = req.body

  if (!food || typeof food !== 'string' || food.trim().length === 0) {
    res.status(400).json({ error: '음식 이름을 입력해주세요' })
    return
  }

  const speciesKr = species === 'dog' ? '강아지' : species === 'cat' ? '고양이' : '강아지·고양이'

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `당신은 반려동물 영양 전문 AI입니다.
"${food.trim()}"이(가) ${speciesKr}에게 안전한지 알려주세요.

다음 형식으로 간결하게 답변해주세요:
1. 안전 여부: 안전 / 주의 / 위험 중 하나
2. 이유: 1~2문장
3. 주의사항 (있다면)

답변은 한국어로 작성하고, 마지막에 "정확한 정보는 수의사에게 문의하세요"를 반드시 명시하세요.`

    const result = await model.generateContent(prompt)
    const answer = result.response.text()

    console.log(`[foods/chat] 음식 문의 완료 - food: ${food}, species: ${speciesKr}`)
    res.json({ answer })
  } catch (err: any) {
    console.error('[foods/chat] Gemini 오류:', err?.message || err)
    res.status(500).json({ error: 'AI 문의 중 오류가 발생했습니다' })
  }
}
