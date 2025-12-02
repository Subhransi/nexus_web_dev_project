const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


if (!mongoURI) {
  console.error("❌ ERROR: MONGODB_URI is NOT set on Render");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✨ MongoDB connected successfully'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/todos', require('./routes/todos'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pomodoro API is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🍃 Server running on port ${PORT}`);
});
