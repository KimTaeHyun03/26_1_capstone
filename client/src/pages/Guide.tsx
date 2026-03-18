import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

interface GuideItem {
  id: string
  category: string
  species: string
  title: string
  content: string
  step_order: number
}

const CATEGORY_LABEL: Record<string, string> = {
  preparation: '입양 준비',
  feeding: '먹이·급여',
  health: '건강 관리',
  grooming: '그루밍',
  behavior: '행동·훈련',
}

const CATEGORIES = ['preparation', 'feeding', 'health', 'grooming', 'behavior']

export default function Guide() {
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog')
  const [selectedCategory, setSelectedCategory] = useState('preparation')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: items = [], isLoading } = useQuery<GuideItem[]>({
    queryKey: ['guide', species],
    queryFn: async () => {
      const res = await api.get(`/api/guide?species=${species}`)
      return res.data
    },
    staleTime: 1000 * 60 * 10,
  })

  const filtered = items.filter((item) => item.category === selectedCategory)

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">초보 보호자 가이드</h1>

      {/* 종 선택 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setSpecies('dog'); setSelectedCategory('preparation') }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm ${species === 'dog' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          🐶 강아지
        </button>
        <button
          onClick={() => { setSpecies('cat'); setSelectedCategory('preparation') }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm ${species === 'cat' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          🐱 고양이
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      {/* 가이드 목록 */}
      {isLoading ? (
        <p className="text-center text-gray-400 py-10">불러오는 중...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <button
                className="w-full text-left px-4 py-3 flex justify-between items-center"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <span className="font-medium text-sm">{item.title}</span>
                <span className="text-gray-400 text-lg">{expandedId === item.id ? '∧' : '∨'}</span>
              </button>
              {expandedId === item.id && (
                <div className="px-4 pb-4 text-sm text-gray-600 whitespace-pre-line border-t border-gray-100 pt-3">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
