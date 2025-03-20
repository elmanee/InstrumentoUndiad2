import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload', upload.single('imagen'), uploadImage); // ✅

export default router;
