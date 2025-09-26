import { Router } from 'express'
import {
    placeOrder,
    getAllOrders,
    updateOrderStatus,
} from '../controllers/orderController.js'

import { authenticateUser } from '../middleware/authMiddleware.js'
import { validateAdminAction } from '../middleware/validationMiddleware.js'

const router = Router()

router
    .route('/')
    .get(authenticateUser, getAllOrders)
    .post(authenticateUser, placeOrder)

router
    .route('/:orderId/status')
    .patch(authenticateUser, validateAdminAction, updateOrderStatus)

export default router
