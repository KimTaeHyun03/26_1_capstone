import axios from 'axios'

// 기상청 Lambert 투영 격자 좌표 변환 상수 (기상청 공식 예제 기반)
const RE = 6371.00877
const GRID = 5.0
const SLAT1 = 30.0
const SLAT2 = 60.0
const OLON = 126.0
const OLAT = 38.0
const XO = 43
const YO = 136

const DEGRAD = Math.PI / 180.0

// 위경도 → 기상청 격자 좌표(nx, ny) 변환
export function latLonToGrid(lat: number, lon: number): { nx: number; ny: number } {
  const re = RE / GRID
  const slat1 = SLAT1 * DEGRAD
  const slat2 = SLAT2 * DEGRAD
  const olon = OLON * DEGRAD
  const olat = OLAT * DEGRAD

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)

  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5)
  ro = (re * sf) / Math.pow(ro, sn)

  const ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5)
  const r = (re * sf) / Math.pow(ra, sn)

  let theta = lon * DEGRAD - olon
  if (theta > Math.PI) theta -= 2.0 * Math.PI
  if (theta < -Math.PI) theta += 2.0 * Math.PI
  theta *= sn

  const nx = Math.floor(r * Math.sin(theta) + XO + 0.5)
  const ny = Math.floor(ro - r * Math.cos(theta) + YO + 0.5)

  return { nx, ny }
}

export interface WeatherData {
  temp: number      // T1H: 기온 (°C)
  pty: number       // PTY: 강수형태 (0:없음, 1:비, 2:비/눈, 3:눈, 5:빗방울 등)
  rain: number      // RN1: 1시간 강수량 (mm)
  windSpeed: number // WSD: 풍속 (m/s)
}

// 기상청 초단기실황 API 호출
export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const { nx, ny } = latLonToGrid(lat, lon)

  const now = new Date()
  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '')

  // 매시 30분 이후 조회 가능 → 현재 분이 30 미만이면 1시간 전 데이터 사용
  const hour = now.getMinutes() < 30 ? now.getHours() - 1 : now.getHours()
  const adjustedHour = (hour + 24) % 24
  const baseTime = String(adjustedHour).padStart(2, '0') + '00'

  const url = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst'
  const params = {
    serviceKey: process.env.WEATHER_API_KEY,
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx,
    ny,
    numOfRows: 10,
  }

  const response = await axios.get(url, { params, timeout: 5000 })
  const items: { category: string; obsrValue: string }[] =
    response.data?.response?.body?.items?.item ?? []

  const getValue = (category: string) => {
    const item = items.find((i) => i.category === category)
    const val = item ? parseFloat(item.obsrValue) : NaN
    return isNaN(val) ? 0 : val
  }

  return {
    temp: getValue('T1H'),
    pty: getValue('PTY'),
    rain: getValue('RN1'),
    windSpeed: getValue('WSD'),
  }
}
