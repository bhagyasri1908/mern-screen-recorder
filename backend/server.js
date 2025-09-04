const express = require('express');
const cors = require('cors');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

// Database
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Backblaze B2 S3 Configuration ---
const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,
  accessKeyId: process.env.B2_ACCESS_KEY_ID,
  secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.B2_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `recordings/recording-${uniqueSuffix}.webm`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'video/webm') return cb(new Error('Only .webm allowed'));
    cb(null, true);
  },
});

// --- Database Setup ---
let db;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  db = {
    all: (sql, params) => pool.query(sql, params).then(res => res.rows),
    get: (sql, params) => pool.query(sql, params).then(res => res.rows[0]),
    run: async (sql, params) => {
      const res = await pool.query(sql, params);
      return { lastID: res.rows[0]?.id || null };
    }
  };

  pool.query(`
    CREATE TABLE IF NOT EXISTS recordings (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      filesize BIGINT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).then(() => console.log('Postgres table ready'))
    .catch(err => console.error('Postgres error:', err.message));

} else {
  db = new sqlite3.Database('./database.db', err => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      filesize INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });

  const { promisify } = require('util');
  db.all = promisify(db.all.bind(db));
  db.get = promisify(db.get.bind(db));
  db.run = (sql, params) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID });
    });
  });
}

// --- Routes ---
app.get('/api/recordings', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM recordings ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recordings', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { originalname, size, key } = req.file;
  const filepath = `https://${process.env.B2_BUCKET_NAME}.${process.env.B2_ENDPOINT}/${key}`;

  try {
    const result = await db.run(
      'INSERT INTO recordings (filename, filepath, filesize) VALUES ($1,$2,$3) RETURNING id',
      [originalname, filepath, size]
    );

    res.status(201).json({
      message: 'Recording uploaded successfully',
      recording: {
        id: result.lastID || result.id,
        filename: originalname,
        filepath,
        filesize: size,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recordings/:id', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM recordings WHERE id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Recording not found' });

    res.redirect(row.filepath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
