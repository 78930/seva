const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

const Report = require('./models/Report');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n${new Date().toLocaleTimeString()} | ${req.method} ${req.path}`);
  next();
});

// Rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many uploads, please try again later',
  standardHeaders: false,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: false,
  legacyHeaders: false,
});

// Validation schemas
const reportSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().min(10).max(500).required(),
  category: Joi.string().valid('infrastructure', 'safety', 'environment', 'service', 'other').default('other'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  latitude: Joi.alternatives().try(Joi.number(), Joi.string().empty('')).optional(),
  longitude: Joi.alternatives().try(Joi.number(), Joi.string().empty('')).optional(),
  locationConsent: Joi.string().valid('true', 'false').default('false'),
}).unknown(true);  // Allow extra fields from multer/formdata

// Setup directories
const uploadsDir = path.join(__dirname, '..', 'uploads');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image' && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  if (file.fieldname === 'audio' && file.mimetype.startsWith('audio/')) {
    return cb(null, true);
  }
  return cb(new Error('Invalid file type'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

// Routes
app.get('/api/health', (req, res) => {
  console.log('✅ HEALTH CHECK');
  res.json({ ok: true, message: 'Server is running', timestamp: new Date() });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.use('/uploads', express.static(uploadsDir));

// ===== ULTRA SIMPLE ENDPOINT - NO VALIDATION =====
app.post('/api/reports-simple', async (req, res) => {
  try {
    console.log('\n🚀 POST /api/reports-simple');
    console.log('Headers:', req.headers['content-type']);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { title = 'Untitled', description = 'No description', category = 'other', priority = 'medium' } = req.body;

    console.log('💾 Creating report...');
    const report = await Report.create({
      title,
      description,
      category,
      priority,
      locationConsent: false,
    });

    console.log('✅ SAVED TO DB:', report._id);

    res.status(201).json({
      success: true,
      message: 'Report saved successfully',
      reportId: report._id,
      report,
    });
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== FULL REPORT ENDPOINT WITH FILE UPLOAD =====
app.post(
  '/api/reports',
  uploadLimiter,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  async (req, res) => {
    try {
      console.log('🚀 POST /api/reports (with files)');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('Files:', req.files ? Object.keys(req.files) : 'none');

      // Validate input
      const { error, value } = reportSchema.validate(req.body);
      if (error) {
        console.log('❌ Validation error:', error.message);
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }

      const {
        title,
        description,
        category,
        priority,
        latitude,
        longitude,
        locationConsent,
      } = value;

      const imageFile = req.files?.image?.[0];
      const audioFile = req.files?.audio?.[0];

      const reportData = {
        title,
        description,
        category,
        priority,
        locationConsent: locationConsent === 'true',
      };

      if (imageFile) {
        reportData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFile.filename}`;
        console.log('📸 Image URL:', reportData.imageUrl);
      }

      if (audioFile) {
        reportData.audioUrl = `${req.protocol}://${req.get('host')}/uploads/${audioFile.filename}`;
        console.log('🎤 Audio URL:', reportData.audioUrl);
      }

      if (locationConsent === 'true' && latitude && longitude) {
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          reportData.location = {
            type: 'Point',
            coordinates: [lng, lat],
          };
          console.log('📍 Location:', reportData.location);
        }
      }

      console.log('💾 Creating report...');
      const report = await Report.create(reportData);

      console.log('✅ SAVED TO DB:', report._id);

      res.status(201).json({
        success: true,
        message: 'Report saved successfully',
        reportId: report._id,
      });
    } catch (error) {
      console.error('❌ ERROR:', error.message);

      // Cleanup files on error
      if (req.files?.image?.[0]) {
        fs.unlink(req.files.image[0].path, () => {});
      }
      if (req.files?.audio?.[0]) {
        fs.unlink(req.files.audio[0].path, () => {});
      }

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// ===== GET ALL REPORTS WITH PAGINATION =====
app.get('/api/reports', apiLimiter, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ GET /api/reports error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== UPDATE REPORT STATUS =====
app.patch('/api/reports/:id/status', apiLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['submitted', 'in_review', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(id, { status }, { new: true });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    console.log('✅ Status updated:', report._id, 'to', status);
    res.json({ success: true, report });
  } catch (error) {
    console.error('❌ PATCH error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== NEARBY REPORTS =====
app.get('/api/reports/nearby', apiLimiter, async (req, res) => {
  try {
    const { lng, lat, radius = 5000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ success: false, error: 'lng and lat required' });
    }

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius),
        },
      },
    }).limit(50);

    res.json({ success: true, reports, count: reports.length });
  } catch (error) {
    console.error('❌ NEARBY error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ UNHANDLED ERROR:', error.message);
  res.status(500).json({ error: error.message });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/problem_reporting')
  .then(() => {
    console.log('\n✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Admin: http://localhost:${PORT}/admin`);
      console.log(`✅ API: http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });
