import express from 'express';
import multer from 'multer';
import path from 'path';
import { getItems, postItem, updateItemStatus, deleteItem } from '../controllers/itemController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateItem, validateStatusUpdate } from '../middleware/validate.js';

const router = express.Router();

// Only allow images, max 5 MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error('Only image files are allowed'), ext && mime);
  },
});

// GET  /api/items         — public
router.get('/', getItems);

// POST /api/items         — authenticated users
router.post('/', authenticate, upload.single('image'), validateItem, postItem);

// PATCH /api/items/:id    — authenticated users
router.patch('/:id', authenticate, validateStatusUpdate, updateItemStatus);

// DELETE /api/items/:id   — admin only
router.delete('/:id', authenticate, requireRole('admin'), deleteItem);

export default router;
