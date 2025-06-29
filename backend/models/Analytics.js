const mongoose = require('mongoose');

const TaskCompletionSchema = new mongoose.Schema({
  taskId: String,
  taskTitle: String,
  completed: Boolean,
  completedAt: Date
});

const DailyAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  timetableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable'
  },
  technique: String,
  energyLevel: String,
  goal: String,
  totalTasks: Number,
  completedTasks: Number,
  totalWorkTime: Number,
  totalBreakTime: Number,
  taskCompletions: [TaskCompletionSchema],
  productivityScore: Number,
  notes: String
}, {
  timestamps: true
});

// Compound index for efficient queries
DailyAnalyticsSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Analytics', DailyAnalyticsSchema); 