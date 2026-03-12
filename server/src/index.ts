import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRouter from './routes/auth'
import petsRouter from './routes/pets'
import guideRouter from './routes/guide'
import foodsRouter from './routes/foods'
import healthRouter from './routes/health'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 미들웨어
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
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
// app.use('/api/feeding', feedingRouter)
// app.use('/api/training', trainingRouter)
// app.use('/api/map', mapRouter)
// app.use('/api/walk', walkRouter)
// app.use('/api/ai', aiRouter)

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
})

export default app
