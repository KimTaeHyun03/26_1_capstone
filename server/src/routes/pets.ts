import { Router } from 'express'
import { getPets, getPet, createPet, updatePet, deletePet } from '../controllers/pets'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', getPets)
router.get('/:id', getPet)
router.post('/', createPet)
router.put('/:id', updatePet)
router.delete('/:id', deletePet)

export default router
