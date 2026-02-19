import express from 'express';
import { uploadCSV } from '../controllers/uploadController.js';
import { upload } from '../middleware/multerConfig.js';

const router = express.Router();

// CSV Upload endpoint
router.post('/upload', upload.single('file'), uploadCSV);

export default router;
