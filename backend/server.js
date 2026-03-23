const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Default root endpoint
app.get('/', (req, res) => {
  res.status(200).send('LMS Portal Backend API is running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.setHeader('X-Deployment-Version', 'server-js-diagnostic-v5');
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    entry_point: 'server.js',
    cors_info: 'mirroring-active-v5'
  });
});

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const videoRoutes = require('./routes/videos');

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos', videoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
