import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import 'dotenv/config';
import { getTeamByName } from './models/teams.js';
import { createCollage } from './models/collages.js';
import { getUserByUsername } from './models/users.js';
import { createVideo } from './models/videos.js';

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_COOKIE_NAME = 'gamesync_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const sessions = new Map();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean)
    .reduce((accumulator, value) => {
      const equalsIndex = value.indexOf('=');

      if (equalsIndex === -1) {
        return accumulator;
      }

      const key = value.slice(0, equalsIndex);
      const val = decodeURIComponent(value.slice(equalsIndex + 1));
      accumulator[key] = val;
      return accumulator;
    }, {});
}

function createSession(userId) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[SESSION_COOKIE_NAME];

  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return { sessionId, ...session };
}

app.get('/', (req, res) => {
    res.send('Welcome to GameSync Server!');
});

app.use(cors({
  origin: true,  //'http://localhost:51979'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // cookies/auth
}));

app.use(express.json());

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await getUserByUsername(username);

    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const sessionId = createSession(user.id);

    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_MS,
      path: '/',
    });

    return res.status(200).json({
      message: 'Login successful',
      userId: user.id,
      username: user.username,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/session', (req, res) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({
    authenticated: true,
    userId: session.userId,
    expiresAt: session.expiresAt,
  });
});

app.post('/api/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[SESSION_COOKIE_NAME];

  if (sessionId) {
    sessions.delete(sessionId);
  }

  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return res.status(200).json({ message: 'Logged out' });
});


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


app.post('/api/upload/:collageId', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file received' });
    }

    // Get collageId from URL parameter
    const collageId = parseInt(req.params.collageId, 10);



    const relativePath = `/videofiles/${req.file.filename}`;  // note: matches your static route
    const fullPath = path.join(__dirname, '..', 'VideoFileStorage', req.file.filename);


    await createVideo({
      collage_id: collageId,
      filename: req.file.filename,
      original_name: req.file.originalname,
      path: relativePath,
      size: req.file.size,
      mime_type: req.file.mimetype,
      createdAt: Date().now,
    });

    res.status(201).json({
      message: 'Video uploaded successfully',
      collageId,                    // ← important for frontend
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: relativePath,
      fullPath,                     // mostly for debugging/server-side
      size: req.file.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});


// Serve the uploaded files statically (so browser can see them)
app.use('/videofiles', express.static(path.join(__dirname, '..', 'VideoFileStorage')));


//Create session endpoint
app.post('/api/sessions', async (req, res) => {
  try {
    const { eventName, organizationName, date, time, description, createdAt } = req.body;

    //Validate required fields
    if (!eventName || !organizationName || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    //Look up team by organization name
    const team = await getTeamByName(organizationName);

    if (!team) {
      return res.status(404).json({ error: `Team with name "${organizationName}" not found` });
    }

    if (team) {
      // create collage with the team_id
      const collage = await createCollage({
        team_id: team.id,
        name: eventName,
        created_at: createdAt || null
      });

      res.status(201).json({
        message: 'Session created successfully',
        collage,
        team_id: team.id,
        session: {
          collageId: collage.id,
          eventName,
          organizationName,
          teamId: team.id,
          date,
          time,
          description,
          createdAt
        }
        });
      }
    }
  catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
    
});







