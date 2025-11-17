const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  todo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo',
    default: null
  },
  duration: {
    type: Number, // total time in minutes (including breaks)
    required: true
  },
  workSessions: {
    type: Number, // number of work sessions completed
    default: 1
  },
  productivityRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', sessionSchema);
