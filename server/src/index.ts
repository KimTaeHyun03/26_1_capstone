import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRouter from './routes/auth'
import petsRouter from './routes/pets'
import guideRouter from './routes/guide'
import foodsRouter from './routes/foods'
import healthRouter from './routes/health'
import trainingRouter from './routes/training'
import mapRouter from './routes/map'
import feedingRouter from './routes/feeding'
import pushRouter from './routes/push'
import walkRouter from './routes/walk'
import { startFeedingCron } from './lib/cron'

dotenv.config()

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'GEMINI_API_KEY']
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) throw new Error(`환경변수 누락: ${key}`)
})

const CLIENT_ORIGIN =
  process.env.NODE_ENV === 'production'
    ? (() => {
        if (!process.env.CLIENT_URL) throw new Error('환경변수 누락: CLIENT_URL')
        return process.env.CLIENT_URL
      })()
    : process.env.CLIENT_URL || 'http://localhost:5173'

const app = express()
const PORT = process.env.PORT || 3000

// 미들웨어
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json())

// 헬스체크
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// 라우터
app.use('/api/auth', authRouter)
app.use('/api/pets', petsRouter)
app.use('/api/guide', guideRouter)
app.use('/api/foods', foodsRouter)
app.use('/api/health', healthRouter)
app.use('/api/feeding', feedingRouter)
app.use('/api/training', trainingRouter)
app.use('/api/map', mapRouter)
app.use('/api/push', pushRouter)
app.use('/api/walk', walkRouter)
// app.use('/api/ai', aiRouter)

startFeedingCron()

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
})

export default app
