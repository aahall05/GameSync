import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.send('Welcome to GameSync Server!');
});

app.use(cors({
  origin: true,  //'http://localhost:51979'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // cookies/auth
}));


app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Open in browser: http://localhost:${PORT}`);
    console.log(`Health check:   http://localhost:${PORT}/health`);
});



// Configure multer to save files to disk


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'VideoFileStorage/');   //folder name
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = `${file.fieldname}-${uniqueSuffix}${ext}`;
    
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 * 2, // 1 GB max 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
});


// Upload route

app.post('/api/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file received' });
    }

    const filePath = `/VideoFileStorage/${req.file.filename}`;
    const fullPath = path.join(__dirname, '..', 'VideoFileStorage', req.file.filename);

    res.status(201).json({
      message: 'Video uploaded successfully',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: filePath,           // relative path
      fullPath,                 // absolute path (for server use)
      size: req.file.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Serve the uploaded files statically (so browser can see them)
app.use('/videofiles', express.static(path.join(__dirname, '..', 'VideoFileStorage')));







