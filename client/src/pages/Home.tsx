import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { differenceInYears, differenceInMonths } from 'date-fns'
import type { RootState } from '../store'
import api from '../lib/axios'

interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat'
  breed: string
  birth_date: string
  weight: number
  neutered: boolean
}

function getAge(birthDate: string) {
  const months = differenceInMonths(new Date(), new Date(birthDate))
  if (months < 12) return `${months}개월`
  return `${differenceInYears(new Date(), new Date(birthDate))}살`
}

export default function Home() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const navigate = useNavigate()

  const { data: pets = [], isLoading, isError } = useQuery<Pet[]>({
    queryKey: ['pets'],
    queryFn: async () => {
      const res = await api.get('/api/pets')
      return res.data
    },
    enabled: isAuthenticated,
  })

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">내 반려동물</h1>
      <p className="text-sm text-gray-500 mb-4">등록된 반려동물을 관리하세요</p>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-400 text-sm">데이터를 불러올 수 없습니다</div>
      ) : pets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🐾</p>
          <p className="text-gray-400 text-sm mb-4">아직 등록된 반려동물이 없어요</p>
          <button
            onClick={() => navigate('/pets/new')}
            className="bg-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-600"
          >
            반려동물 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => navigate(`/pets/${pet.id}`)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:border-amber-200 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                {pet.species === 'dog' ? '🐶' : '🐱'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{pet.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {pet.breed || (pet.species === 'dog' ? '강아지' : '고양이')} · {getAge(pet.birth_date)} · {pet.weight}kg
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {pet.neutered ? '중성화 완료' : '중성화 미완료'}
                </p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </div>
          ))}

          <button
            onClick={() => navigate('/pets/new')}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-amber-300 hover:text-amber-500 transition-colors"
          >
            + 반려동물 추가
          </button>
        </div>
      )}
    </div>
  )
}
