const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  data: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', TimetableSchema); 