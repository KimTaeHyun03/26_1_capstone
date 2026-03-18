import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../lib/axios'
import { loadNaverMapScript, katecToLatLng, createMarker } from '../lib/naver'

type TabType = 'hospital' | 'shelter'

interface PlaceItem {
  title: string
  address: string
  roadAddress: string
  telephone: string
  link: string
  mapx: string
  mapy: string
  distance?: number
}

const TAB_CONFIG: { key: TabType; label: string; query: string; color: string }[] = [
  { key: 'hospital', label: '동물병원', query: '동물병원', color: 'bg-blue-500' },
  { key: 'shelter', label: '보호소', query: '유기동물 보호소', color: 'bg-emerald-500' },
]

export default function Map() {
  const [activeTab, setActiveTab] = useState<TabType>('hospital')
  const [items, setItems] = useState<PlaceItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PlaceItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.5640,
    lng: 126.9979,
  })
  const [mapReady, setMapReady] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [areaName, setAreaName] = useState('')

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)

  // 네이버 지도 초기화
  useEffect(() => {
    loadNaverMapScript()
      .then(() => setMapReady(true))
      .catch((err) => setError(err.message))
  }, [])

  // 지도 렌더링 (mapReady + userLocation 모두 준비 후)
  useEffect(() => {
    if (!mapReady || !userLocation || !mapRef.current) return
    if (mapInstanceRef.current) return // 이미 초기화됨

    mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
      zoom: 16,
    })

    // 내 위치 마커
    new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
      map: mapInstanceRef.current,
      icon: {
        content: `<div style="
          width: 16px; height: 16px;
          background: #EF4444; border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.3);
        "></div>`,
        anchor: new window.naver.maps.Point(8, 8),
      },
    })
  }, [mapReady, userLocation])

  // 마커 전체 제거
  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []
    infoWindowRef.current?.close()
  }

  // 장소 목록으로 마커 표시
  const showMarkers = useCallback((places: PlaceItem[], type: TabType) => {
    if (!mapInstanceRef.current) return
    clearMarkers()

    const bounds = new window.naver.maps.LatLngBounds()

    places.forEach((place) => {
      const { lat, lng } = katecToLatLng(place.mapx, place.mapy)
      const marker = createMarker(mapInstanceRef.current, lat, lng, place.title, type)

      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindowRef.current) infoWindowRef.current.close()

        infoWindowRef.current = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 8px 12px; min-width: 160px; font-size: 13px;">
              <strong>${place.title}</strong>
              ${place.roadAddress ? `<p style="color: #6b7280; margin: 4px 0 0;">${place.roadAddress}</p>` : ''}
              ${place.telephone ? `<p style="color: #3b82f6; margin: 2px 0 0;">${place.telephone}</p>` : ''}
            </div>
          `,
          borderWidth: 0,
          disableAnchor: false,
        })
        infoWindowRef.current.open(mapInstanceRef.current, marker)
        setSelectedItem(place)
      })

      markersRef.current.push(marker)
      bounds.extend(new window.naver.maps.LatLng(lat, lng))
    })

    if (places.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
    }
  }, [])

  // 장소 검색 API 호출
  const fetchPlaces = useCallback(
    async (lat: number, lng: number, tab: TabType, customQuery?: string) => {
      setIsLoading(true)
      setError(null)
      setSelectedItem(null)

      const endpoint = tab === 'hospital' ? '/api/map/hospitals' : '/api/map/shelters'
      const tabConfig = TAB_CONFIG.find((t) => t.key === tab)!

      try {
        const res = await api.get(endpoint, {
          params: {
            lat,
            lng,
            ...(customQuery ? { query: customQuery } : {}),
          },
        })
        const data: PlaceItem[] = res.data
        setItems(data)
        if (mapReady) showMarkers(data, tab)
      } catch {
        setError('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        setItems([])
      } finally {
        setIsLoading(false)
      }
    },
    [mapReady, showMarkers]
  )

  // 좌표 → 지역명 추출 (OpenStreetMap Nominatim, API 키 불필요)
  const getAreaName = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`,
        { headers: { 'User-Agent': 'PetManagementApp' } }
      )
      const data = await res.json()
      const addr = data.address ?? {}
      const city = addr.city || addr.town || addr.county || ''
      const borough = addr.borough || addr.suburb || ''
      return borough ? `${city} ${borough}` : city
    } catch {
      return ''
    }
  }

  // 현재 위치 가져오기
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다.')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        const area = await getAreaName(loc.lat, loc.lng)
        setAreaName(area)
        fetchPlaces(loc.lat, loc.lng, activeTab, area || undefined)
      },
      () => {
        setIsLoading(false)
        setError('위치 정보를 가져올 수 없습니다. 브라우저 위치 권한을 허용해주세요.')
      }
    )
  }, [activeTab, fetchPlaces])

  // 탭 전환 시 재검색
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedItem(null)
    setSearchInput('')
    if (userLocation) {
      fetchPlaces(userLocation.lat, userLocation.lng, tab, areaName || undefined)
    }
  }

  // 직접 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    fetchPlaces(userLocation.lat, userLocation.lng, activeTab, searchInput.trim())
  }

  const activeConfig = TAB_CONFIG.find((t) => t.key === activeTab)!

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="px-4 pt-6 pb-3 flex-shrink-0">
        <h1 className="text-xl font-bold mb-1">동물병원 · 보호소 찾기</h1>
        <p className="text-sm text-gray-500 mb-3">현재 위치 기반으로 주변 시설을 검색합니다</p>

        {/* 탭 */}
        <div className="flex gap-2 mb-3">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? `${tab.color} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.key === 'hospital' ? '🏥' : '🐾'} {tab.label}
            </button>
          ))}
        </div>

        {/* 검색창 */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={`${activeConfig.label} 검색...`}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
          >
            검색
          </button>
        </form>

        {/* 내 위치 버튼 */}
        <button
          onClick={getLocation}
          disabled={isLoading}
          className="w-full py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '검색 중...' : '📍 내 위치로 검색'}
        </button>

        {/* 에러 */}
        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="flex-shrink-0 h-56 bg-gray-100 mx-4 rounded-xl overflow-hidden">
      </div>

      {/* 결과 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {items.length === 0 && !isLoading && (
          <p className="text-center text-gray-400 text-sm py-6">검색 결과가 없습니다.</p>
        )}

        {items.map((item, idx) => {
          const isSelected = selectedItem?.title === item.title
          return (
            <div
              key={idx}
              onClick={() => setSelectedItem(isSelected ? null : item)}
              className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-colors ${
                isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.roadAddress || item.address}
                  </p>
                  {item.distance !== undefined && (
                    <p className="text-xs text-blue-400 mt-0.5">{item.distance}km</p>
                  )}
                  {item.telephone && (
                    <a
                      href={`tel:${item.telephone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-500 mt-1 inline-block"
                    >
                      {item.telephone}
                    </a>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      activeTab === 'hospital'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {activeConfig.label}
                  </span>
                </div>
              </div>

              {/* 상세 확장 */}
              {isSelected && item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 block text-xs text-center text-blue-500 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50"
                >
                  네이버 상세보기 →
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
