import { Response } from 'express'
import { supabase } from '../lib/supabase'
import { getCurrentWeather } from '../lib/weather'
import { AuthRequest } from '../middleware/auth'

type WalkStatus = 'safe' | 'caution' | 'danger'

interface WalkResult {
  status: WalkStatus
  label: string
  reasons: string[]
  weather: {
    temp: number
    pty: number
    windSpeed: number
  }
  disclaimer: string
}

// 체중별 기온 판단 (research.md 6번 기준)
function judgeByTemp(temp: number, weight: number): { status: WalkStatus; reason: string | null } {
  if (temp > 32) return { status: 'danger', reason: `기온 ${temp}°C — 매우 더워 산책 위험` }
  if (temp >= 25) return { status: 'caution', reason: `기온 ${temp}°C — 더운 날씨, 짧게 산책` }

  if (temp < -7) return { status: 'danger', reason: `기온 ${temp}°C — 매우 추워 산책 위험` }

  if (temp >= -7 && temp < 0) {
    if (weight < 10) return { status: 'danger', reason: `기온 ${temp}°C — 소형견은 추위에 취약` }
    return { status: 'caution', reason: `기온 ${temp}°C — 추운 날씨, 짧게 산책` }
  }

  if (temp >= 0 && temp < 7) {
    if (weight < 10) return { status: 'caution', reason: `기온 ${temp}°C — 소형견 주의 필요` }
    return { status: 'safe', reason: null }
  }

  // 7°C 이상 ~ 25°C 미만: 전 견종 적합
  return { status: 'safe', reason: null }
}

// 강수형태 판단
function judgeByPty(pty: number): { status: WalkStatus; reason: string | null } {
  if (pty === 0) return { status: 'safe', reason: null }
  const labels: Record<number, string> = {
    1: '비', 2: '비/눈', 3: '눈', 5: '빗방울', 6: '빗방울·눈날림', 7: '눈날림',
  }
  return {
    status: 'caution',
    reason: `${labels[pty] ?? '강수'} 중 — 산책 시 주의`,
  }
}

// 최종 판단: danger > caution > safe
function mergeStatus(statuses: WalkStatus[]): WalkStatus {
  if (statuses.includes('danger')) return 'danger'
  if (statuses.includes('caution')) return 'caution'
  return 'safe'
}

const STATUS_LABEL: Record<WalkStatus, string> = {
  safe: '🟢 산책 적합',
  caution: '🟡 주의하며 산책',
  danger: '🔴 산책 비권장',
}

// 산책 가능 여부 판단
export async function getWalkStatus(req: AuthRequest, res: Response) {
  const { petId, lat, lng } = req.query as { petId: string; lat: string; lng: string }

  if (!petId || !lat || !lng) {
    res.status(400).json({ error: 'petId, lat, lng는 필수입니다' })
    return
  }

  // 반려동물 정보 조회
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('name, species, weight')
    .eq('id', petId)
    .eq('user_id', req.userId!)
    .single()

  if (petError || !pet) {
    res.status(404).json({ error: '반려동물을 찾을 수 없습니다' })
    return
  }

  if (pet.species === 'cat') {
    res.json({
      status: 'info',
      label: '고양이는 산책 기능을 제공하지 않습니다',
      reasons: ['본 앱의 산책 가능 여부 기능은 강아지 전용입니다'],
      weather: null,
      disclaimer: '',
    })
    return
  }

  // 날씨 조회
  let weather
  try {
    weather = await getCurrentWeather(parseFloat(lat), parseFloat(lng))
  } catch (err: any) {
    console.error('[walk] 날씨 API 오류:', err?.message)
    res.status(500).json({ error: '날씨 정보를 가져오는 데 실패했습니다' })
    return
  }

  const tempResult = judgeByTemp(weather.temp, pet.weight)
  const ptyResult = judgeByPty(weather.pty)

  const reasons = [tempResult.reason, ptyResult.reason].filter(Boolean) as string[]
  const status = mergeStatus([tempResult.status, ptyResult.status])

  if (status === 'safe' && reasons.length === 0) {
    reasons.push('현재 날씨는 산책하기 적합합니다')
  }

  const result: WalkResult = {
    status,
    label: STATUS_LABEL[status],
    reasons,
    weather: {
      temp: weather.temp,
      pty: weather.pty,
      windSpeed: weather.windSpeed,
    },
    disclaimer:
      '본 기준은 PetMD 자료를 참고하였으며, 반려동물 상태에 따라 다를 수 있습니다. 수의사 상담을 권장합니다.',
  }

  console.log(`[walk] 판단 완료 - pet: ${pet.name}, status: ${status}`)
  res.json(result)
}
