import { Request, Response } from 'express'
import axios from 'axios'

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID!
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!

// 네이버 로컬 검색 공통 함수
async function searchLocal(query: string, lat: string, lng: string) {
  const res = await axios.get('https://openapi.naver.com/v1/search/local.json', {
    params: {
      query,
      display: 20,
      sort: 'comment',
    },
    headers: {
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
  })

  const items = res.data.items.map((item: any) => ({
    title: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
    address: item.address,
    roadAddress: item.roadAddress,
    telephone: item.telephone,
    link: item.link,
    mapx: item.mapx, // 카텍계(KATEC) X 좌표
    mapy: item.mapy, // 카텍계(KATEC) Y 좌표
  }))

  return items
}

// GET /api/map/hospitals?lat=&lng=&query=
export async function getHospitals(req: Request, res: Response) {
  const { lat, lng, query } = req.query

  if (!lat || !lng) {
    res.status(400).json({ error: '위치 정보(lat, lng)가 필요합니다' })
    return
  }

  try {
    const searchQuery = (query as string) || '동물병원'
    const items = await searchLocal(searchQuery, lat as string, lng as string)
    console.log(`[map/hospitals] 검색 완료 - query: ${searchQuery}, 결과: ${items.length}개`)
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

  try {
    const searchQuery = (query as string) || '유기동물 보호소'
    const items = await searchLocal(searchQuery, lat as string, lng as string)
    console.log(`[map/shelters] 검색 완료 - query: ${searchQuery}, 결과: ${items.length}개`)
    res.json(items)
  } catch (err: any) {
    console.error('[map/shelters] 네이버 검색 오류:', err?.response?.data || err?.message)
    res.status(500).json({ error: '보호소 검색 중 오류가 발생했습니다' })
  }
}
