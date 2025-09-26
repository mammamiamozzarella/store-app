import { Router } from 'express'
import { getCurrentUser, updateUser } from '../controllers/userController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = Router()

router.use(authenticateUser)

router.get('/account', getCurrentUser)
router.patch('/update', updateUser)

export default router
