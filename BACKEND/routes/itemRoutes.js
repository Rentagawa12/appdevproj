import express from 'express';
import multer from 'multer';
import {
  getItems,
  postItem,
  updateItemStatus,
  deleteItem
} from '../controllers/itemController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

router.get('/', getItems);
router.post('/', upload.single('image'), postItem);
router.patch('/:id', updateItemStatus);
router.delete('/:id', deleteItem); // Admin only

export default router;
