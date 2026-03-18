import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import api from '../lib/axios'

interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat'
  weight: number
}

interface WalkResult {
  status: 'safe' | 'caution' | 'danger' | 'info'
  label: string
  reasons: string[]
  weather: {
    temp: number
    pty: number
    windSpeed: number
  } | null
  disclaimer: string
}

const PTY_LABEL: Record<number, string> = {
  0: '없음',
  1: '비',
  2: '비/눈',
  3: '눈',
  5: '빗방울',
  6: '빗방울·눈날림',
  7: '눈날림',
}

const STATUS_BG: Record<string, string> = {
  safe: 'bg-green-50 border-green-200',
  caution: 'bg-yellow-50 border-yellow-200',
  danger: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
}

const STATUS_TEXT: Record<string, string> = {
  safe: 'text-green-700',
  caution: 'text-yellow-700',
  danger: 'text-red-700',
  info: 'text-blue-700',
}

export default function Walk() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [result, setResult] = useState<WalkResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 반려동물 목록 조회
  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ['pets'],
    queryFn: async () => {
      const res = await api.get('/api/pets')
      return res.data
    },
    enabled: isAuthenticated,
  })

  // 첫 번째 반려동물 자동 선택
  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id)
    }
  }, [pets, selectedPetId])

  const handleCheck = () => {
    if (!selectedPetId) {
      setError('반려동물을 선택해주세요')
      return
    }

    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await api.get<WalkResult>('/api/walk', {
            params: { petId: selectedPetId, lat: latitude, lng: longitude },
          })
          setResult(res.data)
        } catch (err: any) {
          setError(err?.response?.data?.error ?? '산책 정보를 가져오는 데 실패했습니다')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요')
        setLoading(false)
      }
    )
  }

  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? null

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">산책 가능 여부</h1>
      <p className="text-sm text-gray-500 mb-4">현재 날씨 기반으로 산책 적합 여부를 판단합니다 (강아지 전용)</p>

      {/* 반려동물 선택 */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-1">반려동물 선택</label>
        <select
          value={selectedPetId}
          onChange={(e) => {
            setSelectedPetId(e.target.value)
            setResult(null)
            setError(null)
          }}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">선택해주세요</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} ({pet.species === 'dog' ? '강아지' : '고양이'})
            </option>
          ))}
        </select>
      </div>

      {/* 확인 버튼 */}
      <button
        onClick={handleCheck}
        disabled={loading || !selectedPetId}
        className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors mb-4"
      >
        {loading ? '날씨 정보 확인 중...' : '지금 산책 가능한지 확인'}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 결과 카드 */}
      {result && (
        <div className="space-y-3">
          {/* 상태 */}
          <div className={`rounded-xl border p-5 ${STATUS_BG[result.status]}`}>
            <div className={`text-2xl font-bold mb-2 ${STATUS_TEXT[result.status]}`}>
              {result.label}
            </div>
            <ul className="space-y-1">
              {result.reasons.map((reason, i) => (
                <li key={i} className={`text-sm ${STATUS_TEXT[result.status]}`}>
                  · {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* 날씨 상세 */}
          {result.weather && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">현재 날씨</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-gray-800">{result.weather.temp}°C</div>
                  <div className="text-xs text-gray-400 mt-1">기온</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">
                    {PTY_LABEL[result.weather.pty] ?? '없음'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">강수</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">{result.weather.windSpeed}m/s</div>
                  <div className="text-xs text-gray-400 mt-1">풍속</div>
                </div>
              </div>
            </div>
          )}

          {/* 반려동물 체중 정보 */}
          {selectedPet && result.status !== 'info' && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
              <span className="font-medium">{selectedPet.name}</span>
              {' '}({selectedPet.weight}kg ·{' '}
              {selectedPet.weight < 10 ? '소형견' : selectedPet.weight < 20 ? '중형견' : '대형견'})
              기준으로 판단한 결과입니다.
            </div>
          )}

          {/* 면책 문구 */}
          {result.disclaimer && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-400">
              {result.disclaimer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
