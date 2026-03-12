import { Router } from 'express'
import { searchFoods, chatFoods } from '../controllers/foods'

const router = Router()

router.get('/search', searchFoods)
router.post('/chat', chatFoods)

export default router
