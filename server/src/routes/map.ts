import { Router } from 'express'
import { getHospitals, getShelters } from '../controllers/map'

const router = Router()

router.get('/hospitals', getHospitals)
router.get('/shelters', getShelters)

export default router
