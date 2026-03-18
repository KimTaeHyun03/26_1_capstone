import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { differenceInYears } from 'date-fns'
import type { RootState } from '../store'
import api from '../lib/axios'

interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat'
  birth_date: string
  weight: number
  neutered: boolean
}

interface FeedingSchedule {
  id: string
  pet_id: string
  time: string
  amount: number
  enabled: boolean
}

// RER 기반 하루 급여량 계산 (research.md 5번 공식)
function calcDailyAmount(pet: Pet): number {
  const ageYears = differenceInYears(new Date(), new Date(pet.birth_date))
  const rer = 70 * Math.pow(pet.weight, 0.75)

  let factor: number
  if (ageYears < 1) {
    factor = 2.5 // 퍼피/키튼
  } else if (pet.species === 'dog' && ageYears >= 7) {
    factor = 1.4 // 노령 강아지 (7세+)
  } else if (pet.species === 'cat' && ageYears >= 10) {
    factor = 1.1 // 노령 고양이 (10세+)
  } else if (pet.neutered) {
    factor = 1.6 // 성체 중성화
  } else {
    factor = 1.8 // 성체 미중성화
  }

  return Math.round((rer * factor) / 3.5)
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

// Service Worker 등록 및 푸시 구독
async function subscribePush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })
  return sub
}

export default function Feeding() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'calculator' | 'schedule'>('calculator')
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [newTime, setNewTime] = useState('08:00')
  const [newAmount, setNewAmount] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTime, setEditTime] = useState('')
  const [editAmount, setEditAmount] = useState<string>('')
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'subscribed' | 'denied'>('idle')

  // 반려동물 목록 조회
  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ['pets'],
    queryFn: async () => {
      const res = await api.get('/api/pets')
      return res.data
    },
    enabled: isAuthenticated,
  })

  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? null

  // 첫 번째 반려동물 자동 선택
  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id)
    }
  }, [pets, selectedPetId])

  // 알림 권한 상태 확인
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') setNotificationStatus('subscribed')
      else if (Notification.permission === 'denied') setNotificationStatus('denied')
    }
  }, [])

  // 급식 스케줄 조회
  const { data: schedules = [] } = useQuery<FeedingSchedule[]>({
    queryKey: ['feeding', selectedPetId],
    queryFn: async () => {
      const res = await api.get(`/api/feeding/${selectedPetId}`)
      return res.data
    },
    enabled: !!selectedPetId,
  })

  // 스케줄 등록
  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/feeding', {
        petId: selectedPetId,
        time: newTime,
        amount: Number(newAmount),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding', selectedPetId] })
      setNewAmount('')
    },
  })

  // 스케줄 수정
  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/api/feeding/${id}`, {
        time: editTime,
        amount: Number(editAmount),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding', selectedPetId] })
      setEditingId(null)
    },
  })

  // enabled 토글
  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await api.put(`/api/feeding/${id}`, { enabled })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding', selectedPetId] })
    },
  })

  // 스케줄 삭제
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/feeding/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding', selectedPetId] })
    },
  })

  // 푸시 알림 구독
  const handleSubscribe = async () => {
    const sub = await subscribePush()
    if (!sub) {
      setNotificationStatus('denied')
      return
    }
    const json = sub.toJSON()
    try {
      await api.post('/api/push/subscribe', {
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      })
      setNotificationStatus('subscribed')
    } catch {
      setNotificationStatus('error')
    }
  }

  const handleAddSchedule = () => {
    if (!newAmount || Number(newAmount) <= 0) {
      alert('급여량을 입력해주세요')
      return
    }
    createMutation.mutate()
  }

  const startEdit = (s: FeedingSchedule) => {
    setEditingId(s.id)
    setEditTime(s.time)
    setEditAmount(String(s.amount))
  }

  const dailyAmount = selectedPet ? calcDailyAmount(selectedPet) : null
  const ageYears = selectedPet
    ? differenceInYears(new Date(), new Date(selectedPet.birth_date))
    : null

  const lifeStageLabel = (pet: Pet) => {
    const age = differenceInYears(new Date(), new Date(pet.birth_date))
    if (age < 1) return '퍼피/키튼 (1세 미만)'
    if (pet.species === 'dog' && age >= 7) return `노령 강아지 (${age}세)`
    if (pet.species === 'cat' && age >= 10) return `노령 고양이 (${age}세)`
    return `성체${pet.neutered ? ' (중성화)' : ' (미중성화)'} ${age}세`
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">급식 알림 · 급여량 계산기</h1>
      <p className="text-sm text-gray-500 mb-4">RER 공식 기반 하루 권장 급여량과 스케줄 관리</p>

      {/* 반려동물 선택 */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-1">반려동물 선택</label>
        <select
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
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

      {/* 탭 */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'calculator'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          급여량 계산기
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          급식 스케줄
        </button>
      </div>

      {/* 급여량 계산기 탭 */}
      {activeTab === 'calculator' && (
        <div>
          {!selectedPet ? (
            <p className="text-sm text-gray-400 text-center py-8">반려동물을 선택해주세요</p>
          ) : (
            <div className="space-y-3">
              {/* 반려동물 정보 카드 */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-2">{selectedPet.name} 정보</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-amber-700">
                  <div>종: {selectedPet.species === 'dog' ? '강아지' : '고양이'}</div>
                  <div>체중: {selectedPet.weight}kg</div>
                  <div>나이: {ageYears}세</div>
                  <div>중성화: {selectedPet.neutered ? '예' : '아니요'}</div>
                </div>
                <div className="text-xs text-amber-600 mt-1">생애단계: {lifeStageLabel(selectedPet)}</div>
              </div>

              {/* 계산 결과 */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">하루 권장 급여량</h3>
                <div className="text-3xl font-bold text-amber-500">{dailyAmount}g</div>
                <div className="text-xs text-gray-400 mt-1">
                  RER = 70 × {selectedPet.weight}kg^0.75 ={' '}
                  {Math.round(70 * Math.pow(selectedPet.weight, 0.75))}kcal
                </div>
              </div>

              {/* 안내 문구 */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                <p>※ 표준 건식 사료(350kcal/100g) 기준이며, 사료 종류에 따라 ±10~15% 차이가 있을 수 있습니다.</p>
                <p className="mt-1">※ WSAVA 글로벌 영양평가 가이드라인 기반 계산입니다.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 급식 스케줄 탭 */}
      {activeTab === 'schedule' && (
        <div>
          {/* 알림 구독 버튼 */}
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">급식 알림</p>
              <p className="text-xs text-amber-600">
                {notificationStatus === 'subscribed'
                  ? '알림이 활성화되어 있습니다'
                  : notificationStatus === 'denied'
                  ? '알림 권한이 거부되었습니다 (브라우저 설정에서 변경)'
                  : '알림을 허용하면 급식 시간에 푸시 알림을 받을 수 있습니다'}
              </p>
            </div>
            {notificationStatus === 'idle' && (
              <button
                onClick={handleSubscribe}
                className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 shrink-0 ml-2"
              >
                알림 허용
              </button>
            )}
            {notificationStatus === 'subscribed' && (
              <span className="text-xs text-green-500 shrink-0 ml-2">✓ 활성</span>
            )}
          </div>

          {!selectedPetId ? (
            <p className="text-sm text-gray-400 text-center py-8">반려동물을 선택해주세요</p>
          ) : (
            <>
              {/* 스케줄 추가 */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">스케줄 추가</h3>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 flex-1"
                  />
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder={dailyAmount ? `권장 ${dailyAmount}g` : '급여량(g)'}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-28"
                  />
                  <button
                    onClick={handleAddSchedule}
                    disabled={createMutation.isPending}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 disabled:opacity-50 shrink-0"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* 스케줄 목록 */}
              {schedules.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">등록된 스케줄이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3"
                    >
                      {editingId === s.id ? (
                        <>
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-28"
                          />
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-20"
                          />
                          <button
                            onClick={() => updateMutation.mutate(s.id)}
                            disabled={updateMutation.isPending}
                            className="text-xs bg-amber-500 text-white px-2 py-1 rounded"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-gray-400 px-2 py-1"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className="font-medium text-sm">{s.time}</span>
                            <span className="text-gray-400 text-sm ml-2">{s.amount}g</span>
                          </div>
                          {/* enabled 토글 */}
                          <button
                            onClick={() => toggleMutation.mutate({ id: s.id, enabled: !s.enabled })}
                            className={`w-9 h-5 rounded-full transition-colors relative ${
                              s.enabled ? 'bg-amber-400' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                s.enabled ? 'translate-x-[18px]' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => startEdit(s)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-1"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(s.id)}
                            className="text-xs text-red-400 hover:text-red-600 px-1"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
