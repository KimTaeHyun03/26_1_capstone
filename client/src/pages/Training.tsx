import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

interface TrainingStep {
  step: number
  title: string
  description: string
}

interface TrainingGuide {
  id: string
  category: 'basic' | 'behavior' | 'trick'
  title: string
  steps: TrainingStep[]
  difficulty: 'easy' | 'medium' | 'hard'
}

const CATEGORIES: { key: 'basic' | 'behavior' | 'trick'; label: string }[] = [
  { key: 'basic', label: '기초 훈련' },
  { key: 'behavior', label: '행동 교정' },
  { key: 'trick', label: '재주' },
]

const DIFFICULTY_LABEL: Record<string, { label: string; color: string }> = {
  easy: { label: '쉬움', color: 'bg-green-100 text-green-600' },
  medium: { label: '보통', color: 'bg-yellow-100 text-yellow-600' },
  hard: { label: '어려움', color: 'bg-red-100 text-red-600' },
}

export default function Training() {
  const [activeCategory, setActiveCategory] = useState<'basic' | 'behavior' | 'trick'>('basic')
  const [openId, setOpenId] = useState<string | null>(null)

  const { data: guides = [], isLoading } = useQuery<TrainingGuide[]>({
    queryKey: ['training', activeCategory],
    queryFn: async () => {
      const res = await api.get(`/api/training?category=${activeCategory}`)
      return res.data
    },
    staleTime: 1000 * 60 * 10,
  })

  const toggleOpen = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">훈련 가이드</h1>
      <p className="text-sm text-gray-500 mb-2">단계별 훈련 방법을 확인해보세요</p>
      <div className="bg-yellow-100 border-l-4 border-yellow-400 rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
        <span className="text-xl">🐶</span>
        <div>
          <p className="text-sm font-semibold text-yellow-800">강아지 전용 콘텐츠</p>
          <p className="text-xs text-yellow-700 mt-0.5">본 훈련 가이드는 강아지 전용입니다. 고양이는 훈련 방식이 달라 별도 가이드가 제공되지 않습니다.</p>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setActiveCategory(cat.key); setOpenId(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 가이드 목록 */}
      {isLoading && <p className="text-center text-gray-400 py-10">불러오는 중...</p>}

      <div className="space-y-3">
        {guides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* 헤더 */}
            <button
              onClick={() => toggleOpen(guide.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{guide.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_LABEL[guide.difficulty].color}`}>
                  {DIFFICULTY_LABEL[guide.difficulty].label}
                </span>
              </div>
              <span className="text-gray-400 text-xs">{openId === guide.id ? '▲' : '▼'}</span>
            </button>

            {/* 단계 목록 */}
            {openId === guide.id && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                {guide.steps.map((step) => (
                  <div key={step.step} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                      {step.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{step.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
