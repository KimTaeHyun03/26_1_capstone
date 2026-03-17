import { Router } from 'express'
import {
  getFeedingSchedules,
  createFeedingSchedule,
  updateFeedingSchedule,
  deleteFeedingSchedule,
} from '../controllers/feeding'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/:petId', getFeedingSchedules)
router.post('/', createFeedingSchedule)
router.put('/:id', updateFeedingSchedule)
router.delete('/:id', deleteFeedingSchedule)

export default router
