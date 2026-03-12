import { Router } from 'express'
import { searchFoods } from '../controllers/foods'

const router = Router()

router.get('/search', searchFoods)

export default router
