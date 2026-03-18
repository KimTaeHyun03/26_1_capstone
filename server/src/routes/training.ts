import { Router } from 'express'
import { getTraining } from '../controllers/training'

const router = Router()

router.get('/', getTraining)

export default router
