import { Router } from 'express'
import { getWalkStatus } from '../controllers/walk'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', getWalkStatus)

export default router
