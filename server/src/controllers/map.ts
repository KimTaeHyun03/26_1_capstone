import { Request, Response } from 'express'
import axios from 'axios'

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID!
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!

// Haversine 거리 계산 (km)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// 네이버 로컬 검색 공통 함수 — 많이 가져와서 가까운 순 5개 반환
async function searchLocal(query: string, userLat: number, userLng: number) {
  const res = await axios.get('https://openapi.naver.com/v1/search/local.json', {
    params: {
      query,
      display: 5,
      sort: 'random',
    },
    headers: {
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
  })

  const items = res.data.items.map((item: any) => {
    const lat = parseInt(item.mapy) / 10_000_000
    const lng = parseInt(item.mapx) / 10_000_000
    const distance = getDistance(userLat, userLng, lat, lng)
    return {
      title: item.title.replace(/<[^>]*>/g, ''),
      address: item.address,
      roadAddress: item.roadAddress,
      telephone: item.telephone,
      link: item.link,
      mapx: item.mapx,
      mapy: item.mapy,
      distance: Math.round(distance * 10) / 10, // km, 소수점 1자리
    }
  })

  // 거리 오름차순 정렬 후 5개 반환
  return items.sort((a: any, b: any) => a.distance - b.distance).slice(0, 5)
}

// GET /api/map/hospitals?lat=&lng=&query=
export async function getHospitals(req: Request, res: Response) {
  const { lat, lng, query } = req.query

  if (!lat || !lng) {
    res.status(400).json({ error: '위치 정보(lat, lng)가 필요합니다' })
    return
  }

  const latNum = parseFloat(lat as string)
  const lngNum = parseFloat(lng as string)
  if (isNaN(latNum) || isNaN(lngNum)) {
    res.status(400).json({ error: 'lat, lng는 유효한 숫자여야 합니다' })
    return
  }

  try {
    const keyword = query ? `${query} 동물병원` : '동물병원'
    const items = await searchLocal(keyword, latNum, lngNum)
    console.log(`[map/hospitals] 검색 완료 - query: ${keyword}, 결과: ${items.length}개`)
    res.json(items)
  } catch (err: any) {
    console.error('[map/hospitals] 네이버 검색 오류:', err?.response?.data || err?.message)
    res.status(500).json({ error: '동물병원 검색 중 오류가 발생했습니다' })
  }
}

// GET /api/map/shelters?lat=&lng=&query=
export async function getShelters(req: Request, res: Response) {
  const { lat, lng, query } = req.query

  if (!lat || !lng) {
    res.status(400).json({ error: '위치 정보(lat, lng)가 필요합니다' })
    return
  }

  const latNum = parseFloat(lat as string)
  const lngNum = parseFloat(lng as string)
  if (isNaN(latNum) || isNaN(lngNum)) {
    res.status(400).json({ error: 'lat, lng는 유효한 숫자여야 합니다' })
    return
  }

  try {
    const keyword = query ? `${query} 동물보호소` : '유기동물 보호소'
    const items = await searchLocal(keyword, latNum, lngNum)
    console.log(`[map/shelters] 검색 완료 - query: ${keyword}, 결과: ${items.length}개`)
    res.json(items)
  } catch (err: any) {
    console.error('[map/shelters] 네이버 검색 오류:', err?.response?.data || err?.message)
    res.status(500).json({ error: '보호소 검색 중 오류가 발생했습니다' })
  }
}
