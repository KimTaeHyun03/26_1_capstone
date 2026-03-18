import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import api from '../lib/axios'

interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat'
}

interface HealthResult {
  diagnosis: string
  saved: boolean
}

const SYMPTOMS: Record<string, string[]> = {
  '소화기': ['구토', '설사', '변비', '식욕 저하', '과식'],
  '호흡기': ['기침', '재채기', '코막힘', '호흡 곤란'],
  '행동': ['무기력', '과도한 긁음', '공격성 증가', '숨기'],
  '외형': ['눈곱·눈물', '털 빠짐', '피부 발진', '절뚝거림'],
  '배뇨': ['소변 횟수 증가', '혈뇨', '소변 못 봄'],
  '기타': ['체중 감소', '발열', '과도한 음수량'],
}

export default function Health() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [checkedSymptoms, setCheckedSymptoms] = useState<string[]>([])
  const [result, setResult] = useState<HealthResult | null>(null)

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ['pets'],
    queryFn: async () => {
      const res = await api.get('/api/pets')
      return res.data
    },
    enabled: isAuthenticated,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/health', {
        petId: selectedPetId,
        symptoms: checkedSymptoms,
      })
      return res.data as HealthResult
    },
    onSuccess: (data) => setResult(data),
  })

  const toggleSymptom = (symptom: string) => {
    setCheckedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    )
  }

  const handleSubmit = () => {
    if (!selectedPetId) {
      alert('반려동물을 선택해주세요')
      return
    }
    if (checkedSymptoms.length === 0) {
      alert('증상을 1개 이상 선택해주세요')
      return
    }
    setResult(null)
    mutation.mutate()
  }

  const handleReset = () => {
    setCheckedSymptoms([])
    setResult(null)
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">증상 기반 건강 체크</h1>
      <p className="text-sm text-gray-500 mb-4">증상을 선택하면 AI가 분석해드립니다</p>

      {/* 반려동물 선택 */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-1">반려동물 선택</label>
        <select
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">선택해주세요</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} ({pet.species === 'dog' ? '강아지' : '고양이'})
            </option>
          ))}
        </select>
      </div>

      {/* 증상 체크박스 */}
      {!result && (
        <div className="space-y-4 mb-6">
          {Object.entries(SYMPTOMS).map(([category, symptoms]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      checkedSymptoms.includes(symptom)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 선택된 증상 요약 */}
      {checkedSymptoms.length > 0 && !result && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-600 font-medium mb-1">선택된 증상 ({checkedSymptoms.length}개)</p>
          <p className="text-sm text-blue-800">{checkedSymptoms.join(', ')}</p>
        </div>
      )}

      {/* 분석 버튼 */}
      {!result && (
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {mutation.isPending ? 'AI 분석 중...' : 'AI 분석 요청'}
        </button>
      )}

      {/* 분석 결과 */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h3 className="font-medium">AI 분석 결과</h3>
            {result.saved && <span className="text-xs text-green-500 ml-auto">저장됨</span>}
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line">{result.diagnosis}</p>
          <p className="text-xs text-gray-400 mt-3">
            ※ 본 분석은 참고용이며, 정확한 진단은 수의사와 상담하세요.
          </p>
        </div>
      )}

      {mutation.isError && (
        <p className="text-red-500 text-sm text-center mt-2">분석 중 오류가 발생했습니다</p>
      )}

      {result && (
        <button
          onClick={handleReset}
          className="w-full border border-gray-200 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50"
        >
          다시 체크하기
        </button>
      )}
    </div>
  )
}
