import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRegister } from '../middleware/validate.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateRegister, login);

export default router;
