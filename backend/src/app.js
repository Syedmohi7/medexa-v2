const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

/* ================= SECURITY ================= */
app.use(helmet());

// Trust proxy (IMPORTANT for Railway / rate-limit)
app.set('trust proxy', 1);

/* ================= RATE LIMIT ================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

/* ================= CORS (FIXED) ================= */
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true
  })
);

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/symptoms', require('./routes/symptom.routes'));
app.use('/api/recommendations', require('./routes/recommendation.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/analysis', require('./routes/analysis.routes'));

/* ================= HEALTH CHECK ================= */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MEDEXA API is running',
    timestamp: new Date().toISOString()
  });
});

/* ================= ERRORS ================= */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
