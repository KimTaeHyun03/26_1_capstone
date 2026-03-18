import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import api from '../lib/axios'

const schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  species: z.enum(['dog', 'cat']),
  breed: z.string().optional(),
  birth_date: z.string().min(1, '생년월일을 입력해주세요'),
  weight: z.coerce.number().positive('체중은 0보다 커야 합니다'),
  neutered: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Pet extends FormData {
  id: string
}

export default function Pets() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const isNew = id === 'new' || !id
  const petId = isNew ? null : id

  const { data: pet } = useQuery<Pet>({
    queryKey: ['pet', petId],
    queryFn: async () => {
      const res = await api.get(`/api/pets/${petId}`)
      return res.data
    },
    enabled: !!petId && isAuthenticated,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { species: 'dog', neutered: false },
  })

  const selectedSpecies = watch('species')

  // 수정 시 기존 데이터 채우기
  useEffect(() => {
    if (pet) {
      reset({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        birth_date: pet.birth_date,
        weight: pet.weight,
        neutered: pet.neutered,
      })
    }
  }, [pet, reset])

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/api/pets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      navigate('/')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => api.put(`/api/pets/${petId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      navigate('/')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/pets/${petId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      navigate('/')
    },
  })

  const onSubmit = (data: FormData) => {
    if (isNew) {
      createMutation.mutate(data)
    } else {
      updateMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (confirm(`정말 삭제하시겠어요?`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          ←
        </button>
        <h1 className="text-xl font-bold">{isNew ? '반려동물 등록' : '반려동물 수정'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 종 선택 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">종류</label>
          <div className="flex gap-3">
            {(['dog', 'cat'] as const).map((s) => (
              <label key={s} className="flex-1">
                <input type="radio" value={s} {...register('species')} className="sr-only" />
                <div className={`border-2 rounded-xl py-3 text-center cursor-pointer transition-colors ${selectedSpecies === s ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                  <span className="text-2xl">{s === 'dog' ? '🐶' : '🐱'}</span>
                  <p className="text-sm font-medium mt-1">{s === 'dog' ? '강아지' : '고양이'}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 이름 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">이름 *</label>
          <input
            {...register('name')}
            placeholder="반려동물 이름"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* 품종 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">품종</label>
          <input
            {...register('breed')}
            placeholder="품종 (선택)"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* 생년월일 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">생년월일 *</label>
          <input
            {...register('birth_date')}
            type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date.message}</p>}
        </div>

        {/* 체중 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">체중 (kg) *</label>
          <input
            {...register('weight')}
            type="number"
            step="0.1"
            placeholder="예: 4.5"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
        </div>

        {/* 중성화 */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-gray-700">중성화 여부</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('neutered')} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-checked:bg-amber-400 rounded-full transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-[18px]" />
          </label>
        </div>

        {/* 등록/수정 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {isNew ? '등록하기' : '수정하기'}
        </button>

        {/* 삭제 버튼 */}
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full py-3 rounded-xl text-sm text-red-400 border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            삭제하기
          </button>
        )}
      </form>
    </div>
  )
}
