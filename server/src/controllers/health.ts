import { Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '../lib/supabase'
import { AuthRequest } from '../middleware/auth'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// 건강 체크 기록 조회
export async function getHealthLogs(req: AuthRequest, res: Response) {
  const { petId } = req.params

  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[health] 건강 기록 조회 오류:', error)
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
}

// 증상 분석 및 저장
export async function analyzeHealth(req: AuthRequest, res: Response) {
  const { petId, symptoms } = req.body

  if (!petId || !symptoms || symptoms.length === 0) {
    res.status(400).json({ error: '반려동물과 증상을 입력해주세요' })
    return
  }

  // 반려동물 정보 조회 (종, 이름)
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('name, species')
    .eq('id', petId)
    .eq('user_id', req.userId!)
    .single()

  if (petError || !pet) {
    console.error('[health] 반려동물 조회 오류:', petError)
    res.status(404).json({ error: '반려동물을 찾을 수 없습니다' })
    return
  }

  const speciesKr = pet.species === 'dog' ? '강아지' : '고양이'
  const symptomList = symptoms.join(', ')

  // Gemini 분석
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `당신은 수의학 전문 AI 어시스턴트입니다.
다음 반려동물의 증상을 분석하고 간결하게 답변해주세요.

반려동물: ${pet.name} (${speciesKr})
증상: ${symptomList}

다음 형식으로 답변해주세요:
1. 가능한 원인 (2~3가지)
2. 즉시 병원 방문이 필요한지 여부
3. 보호자가 할 수 있는 조치

※ 반드시 마지막에 "정확한 진단을 위해 수의사 상담을 권장합니다"라고 명시하세요.
답변은 한국어로 3~5문장 내외로 간결하게 작성하세요.`

    const result = await model.generateContent(prompt)
    const diagnosis = result.response.text()

    // health_logs에 저장
    const { error: saveError } = await supabase
      .from('health_logs')
      .insert({ pet_id: petId, symptoms, diagnosis })

    if (saveError) {
      console.error('[health] 건강 기록 저장 오류:', saveError)
      res.status(500).json({ error: saveError.message })
      return
    }

    console.log(`[health] 분석 완료 - pet: ${pet.name}, symptoms: ${symptomList}`)
    res.json({ diagnosis, saved: true })
  } catch (err: any) {
    console.error('[health] Gemini 분석 실패:', err?.message || err)
    res.status(500).json({ error: 'AI 분석 중 오류가 발생했습니다' })
  }
}
