import { Router } from 'express'
import { getPets, createPet, updatePet, deletePet } from '../controllers/pets'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', getPets)
router.post('/', createPet)
router.put('/:id', updatePet)
router.delete('/:id', deletePet)

export default router
