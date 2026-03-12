import { Router } from 'express'
import { getHealthLogs, analyzeHealth } from '../controllers/health'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/:petId', getHealthLogs)
router.post('/', analyzeHealth)

export default router
