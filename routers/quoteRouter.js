import { Router } from 'express';
import { addToCart, getCart } from '../controllers/quoteController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateUser);

router.get('/', getCart);

router.post('/add', addToCart);

export default router;
