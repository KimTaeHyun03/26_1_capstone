import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../lib/axios'

interface FoodItem {
  id: string
  name: string
  risk_level: 'high' | 'medium' | 'low'
  symptoms: string
  species: 'dog' | 'cat' | 'both'
}

const RISK_LABEL: Record<string, { label: string; color: string }> = {
  high: { label: '위험', color: 'bg-red-100 text-red-600' },
  medium: { label: '주의', color: 'bg-yellow-100 text-yellow-600' },
  low: { label: '낮음', color: 'bg-green-100 text-green-600' },
}

const SPECIES_LABEL: Record<string, string> = {
  dog: '강아지',
  cat: '고양이',
  both: '강아지·고양이',
}

export default function Food() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [species, setSpecies] = useState<'all' | 'dog' | 'cat'>('all')
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)

  const { data: results = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ['foods', search, species],
    queryFn: async () => {
      if (!search) return []
      const params = new URLSearchParams({ q: search })
      if (species !== 'all') params.append('species', species)
      const res = await api.get(`/api/foods/search?${params}`)
      return res.data
    },
    enabled: !!search,
  })

  const aiMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/foods/chat', {
        food: search,
        species: species === 'all' ? undefined : species,
      })
      return res.data.answer as string
    },
    onSuccess: (data) => setAiAnswer(data),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setAiAnswer(null)
    setSearch(query.trim())
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">위험 음식 검색</h1>
      <p className="text-sm text-gray-500 mb-4">반려동물에게 위험한 음식을 검색해보세요</p>

      {/* 종 필터 */}
      <div className="flex gap-2 mb-3">
        {(['all', 'dog', 'cat'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSpecies(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${species === s ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {s === 'all' ? '전체' : s === 'dog' ? '🐶 강아지' : '🐱 고양이'}
          </button>
        ))}
      </div>

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="음식 이름 검색 (예: 초콜릿)"
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
        >
          검색
        </button>
      </form>

      {/* 결과 */}
      {isLoading && <p className="text-center text-gray-400 py-10">검색 중...</p>}

      {!isLoading && search && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">DB에 등록되지 않은 음식입니다</p>
          {!aiAnswer && (
            <button
              onClick={() => aiMutation.mutate()}
              disabled={aiMutation.isPending}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {aiMutation.isPending ? 'AI 분석 중...' : '🤖 AI에게 물어보기'}
            </button>
          )}
          {aiMutation.isError && (
            <p className="text-red-400 text-sm mt-2">AI 문의 중 오류가 발생했습니다</p>
          )}
          {aiAnswer && (
            <div className="text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <h3 className="font-medium">AI 답변</h3>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">{aiAnswer}</p>
              <p className="text-xs text-gray-400 mt-3">※ 본 답변은 참고용이며, 정확한 정보는 수의사에게 문의하세요.</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {results.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{item.name}</span>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_LABEL[item.risk_level].color}`}>
                  {RISK_LABEL[item.risk_level].label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {SPECIES_LABEL[item.species]}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{item.symptoms}</p>
          </div>
        ))}
      </div>

      {!search && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">음식 이름을 입력하고 검색해보세요</p>
          <p className="text-xs mt-1">출처: ASPCA Animal Poison Control</p>
        </div>
      )}
    </div>
  )
}
