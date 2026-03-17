import { Router } from 'express'
import { subscribe, unsubscribe } from '../controllers/push'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.post('/subscribe', subscribe)
router.delete('/unsubscribe', unsubscribe)

export default router
