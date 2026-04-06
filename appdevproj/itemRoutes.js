import express from 'express';
import multer from 'multer';
import path from 'path';
import Item from '../models/itemModel.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware to parse form data
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Debugging: Log the request body and file
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const { itemName, description, dateLostOrFound, status, contactInfo } = req.body;

    // Validation
    if (!itemName || !description || !dateLostOrFound || !status || !contactInfo) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const imageURL = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = new Item({
      itemName,
      description,
      dateLostOrFound,
      status,
      contactInfo,
      imageURL
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error saving item:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;