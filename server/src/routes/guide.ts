import { Router } from 'express'
import { getGuide } from '../controllers/guide'

const router = Router()

router.get('/', getGuide)

export default router
