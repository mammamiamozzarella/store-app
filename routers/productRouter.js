import { Router } from 'express'

const router = Router()

import {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js'

import {
    validateProductInput,
    validateAdminAction,
    validateProductUpdateInput,
} from '../middleware/validationMiddleware.js'

import { authenticateUser } from '../middleware/authMiddleware.js'

router
    .route('/')
    .get(getAllProducts)
    .post(authenticateUser, validateAdminAction, validateProductInput, createProduct)

router
    .route('/:id')
    .get(getProduct)
    .patch(authenticateUser, validateAdminAction, validateProductUpdateInput, updateProduct)
    .delete(authenticateUser, validateAdminAction, validateProductInput, deleteProduct)

export default router