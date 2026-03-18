// 네이버 지도 SDK 타입 선언
declare global {
  interface Window {
    naver: any
  }
}

// 네이버 지도 SDK 동적 로드
export function loadNaverMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve()
      return
    }

    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID
    if (!clientId) {
      reject(new Error('VITE_NAVER_CLIENT_ID 환경변수가 설정되지 않았습니다'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('네이버 지도 스크립트 로드 실패'))
    document.head.appendChild(script)
  })
}

// KATEC 좌표 → WGS84 위경도 변환 (네이버 로컬 검색 API는 KATEC 좌표 반환)
// 네이버 로컬 검색 결과의 mapx, mapy는 소수점 없는 정수형 경위도 * 10,000,000
export function katecToLatLng(mapx: string, mapy: string): { lat: number; lng: number } {
  const lng = parseInt(mapx) / 10_000_000
  const lat = parseInt(mapy) / 10_000_000
  return { lat, lng }
}

// 네이버 지도 마커 생성
export function createMarker(
  map: any,
  lat: number,
  lng: number,
  title: string,
  type: 'hospital' | 'shelter'
): any {
  const color = type === 'hospital' ? '#3B82F6' : '#10B981'

  const marker = new window.naver.maps.Marker({
    position: new window.naver.maps.LatLng(lat, lng),
    map,
    title,
    icon: {
      content: `
        <div style="
          background: ${color};
          color: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          <span style="transform: rotate(45deg); font-size: 14px;">
            ${type === 'hospital' ? '🏥' : '🐾'}
          </span>
        </div>
      `,
      anchor: new window.naver.maps.Point(14, 28),
    },
  })

  return marker
}
