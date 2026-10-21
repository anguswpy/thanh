const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PHOTOS_DIR = path.join(__dirname, 'public', 'photos');

// Ensure public/photos directory exists
if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer to save uploaded photos directly into /public/photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PHOTOS_DIR),
    filename: (req, file, cb) => {
        const safeName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, safeName);
    }
});
const upload = multer({ storage });

// GET /api/photos -> Automatically lists all images in /public/photos
app.get('/api/photos', (req, res) => {
    fs.readdir(PHOTOS_DIR, (err, files) => {
        if (err) return res.json({ photos: [] });
        const photos = files
            .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
            .map(f => ({
                url: `/photos/${f}`,
                fallback: `/photos/${f}`,
                caption: f.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ') + ' ✨'
            }));
        res.json({ photos });
    });
});

// POST /api/photos -> Uploads a new photo from the website form to the server
app.post('/api/photos', upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
        success: true,
        url: `/photos/${req.file.filename}`,
        caption: req.body.caption || req.file.originalname
    });
});

// POST /api/cheer -> Increments global server-side fan cheer counter
let totalCheers = 2812;
app.post('/api/cheer', (req, res) => {
    totalCheers++;
    res.json({ cheers: totalCheers });
});

app.listen(PORT, () => {
    console.log(`✨ Nguyễn Đạo Thành Server running at http://localhost:${PORT}`);
});
