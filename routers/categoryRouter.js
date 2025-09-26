import { Router } from 'express'

const router = Router()

import {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js'

import {
    validateAdminAction,
    validateCategoryInput,
    validateCategoryUpdateInput,
} from '../middleware/validationMiddleware.js'

import { authenticateUser } from '../middleware/authMiddleware.js'

router
    .route('/')
    .get(getAllCategories)
    .post(authenticateUser, validateAdminAction, validateCategoryInput, createCategory)

router
    .route('/:id')
    .get(getCategory)
    .patch(authenticateUser, validateAdminAction, validateCategoryInput, validateCategoryUpdateInput, updateCategory)
    .delete(authenticateUser, validateAdminAction, deleteCategory)

export default router