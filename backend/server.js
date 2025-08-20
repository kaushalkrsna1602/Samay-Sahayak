const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
require('dotenv').config();

const Timetable = require('./models/Timetable');
const Analytics = require('./models/Analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Production CORS configuration
const corsOptions = {
  origin: ['https://samay-sahayak.vercel.app', 'http://localhost:3000'],
  credentials: false,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware for CORS issues
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.error('Please check your MONGODB_URI environment variable');
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Add connection error handler
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate timetable endpoint
app.post('/api/generate-timetable', async (req, res) => {
  try {
    const { tasks, technique, sessionConfig, userPreferences } = req.body;

    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ error: 'No tasks provided' });
    }

    if (!technique || !sessionConfig) {
      return res.status(400).json({ error: 'Technique and session configuration required' });
    }

    // Create enhanced prompt for Gemini AI with user preferences
    const prompt = createTimetablePrompt(tasks, technique, sessionConfig, userPreferences);

    // Generate response using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response to extract timetable
    const timetable = parseTimetableResponse(text);

    res.json({
      success: true,
      timetable,
      rawResponse: text
    });

  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({
      error: 'Failed to generate timetable',
      details: error.message
    });
  }
});

app.post('/api/generate-ceo-timetable', async (req, res) => {
    try {
      const { randomPlan, userPreferences } = req.body;

      if (!randomPlan) {
        return res.status(400).json({ error: 'No plan provided' });
      }

      const prompt = createCEOPrompt(randomPlan, userPreferences);

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const timetable = parseTimetableResponse(text);

      res.json({
        success: true,
        timetable,
      });

    } catch (error) {
      console.error('Error generating CEO timetable:', error);
      res.status(500).json({
        error: 'Failed to generate CEO timetable',
        details: error.message
      });
    }
});

// Save timetable
app.post('/api/timetables', async (req, res) => {
  try {
    const { userId, timetable } = req.body;
    if (!userId || !timetable) {
      return res.status(400).json({ error: 'userId and timetable are required' });
    }
    const saved = await Timetable.create({ userId, data: timetable });
    res.json({ success: true, timetable: saved });
  } catch (error) {
    console.error('Error saving timetable:', error);
    res.status(500).json({ error: 'Failed to save timetable' });
  }
});

// Get all timetables for a user
app.get('/api/timetables', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(500).json({
        error: 'Database connection error. Please check MongoDB configuration.',
        details: 'MongoDB is not connected'
      });
    }

    const timetables = await Timetable.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, timetables });
  } catch (error) {
    console.error('Error fetching timetables:', error);

    // Provide more specific error messages
    if (error.name === 'MongoNetworkError') {
      res.status(500).json({
        error: 'Database connection failed',
        details: 'Unable to connect to MongoDB'
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        error: 'Invalid request data',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to fetch timetables',
        details: error.message
      });
    }
  }
});

// Delete a timetable
app.delete('/api/timetables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Timetable.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ error: 'Failed to delete timetable' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Samay Sahayak Backend is running' });
});

// Analytics endpoints
app.post('/api/analytics', async (req, res) => {
  try {
    const { userId, date, timetableId, technique, energyLevel, goal, totalTasks, totalWorkTime, totalBreakTime, taskCompletions } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ error: 'userId and date are required' });
    }

    // Calculate productivity score
    const completedTasks = taskCompletions.filter(t => t.completed).length;
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Create or update analytics for the day
    const analyticsData = {
      userId,
      date,
      timetableId,
      technique,
      energyLevel,
      goal,
      totalTasks,
      completedTasks,
      totalWorkTime,
      totalBreakTime,
      taskCompletions,
      productivityScore
    };

    const analytics = await Analytics.findOneAndUpdate(
      { userId, date },
      analyticsData,
      { upsert: true, new: true }
    );

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error saving analytics:', error);
    res.status(500).json({ error: 'Failed to save analytics' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let query = { userId };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const analytics = await Analytics.find(query).sort({ date: -1 });

    // Calculate aggregated metrics
    const totalDays = analytics.length;
    const totalTasksCompleted = analytics.reduce((sum, a) => sum + a.completedTasks, 0);
    const totalWorkTime = analytics.reduce((sum, a) => sum + a.totalWorkTime, 0);
    const averageProductivityScore = totalDays > 0 ? Math.round(analytics.reduce((sum, a) => sum + a.productivityScore, 0) / totalDays) : 0;

    // Find most used technique
    const techniqueCounts = {};
    analytics.forEach(a => {
      if (a.technique) {
        techniqueCounts[a.technique] = (techniqueCounts[a.technique] || 0) + 1;
      }
    });
    const mostUsedTechnique = Object.keys(techniqueCounts).length > 0
      ? Object.keys(techniqueCounts).reduce((a, b) => techniqueCounts[a] > techniqueCounts[b] ? a : b)
      : 'None';

    const metrics = {
      totalDays,
      totalTasksCompleted,
      totalWorkTime,
      averageProductivityScore,
      mostUsedTechnique,
      averageTasksPerDay: totalDays > 0 ? Math.round(totalTasksCompleted / totalDays) : 0,
      averageWorkTimePerDay: totalDays > 0 ? Math.round(totalWorkTime / totalDays) : 0
    };

    res.json({
      success: true,
      analytics,
      metrics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.put('/api/analytics/task', async (req, res) => {
  try {
    const { userId, date, taskId, completed } = req.body;

    if (!userId || !date || taskId === undefined) {
      return res.status(400).json({ error: 'userId, date, and taskId are required' });
    }

    const analytics = await Analytics.findOne({ userId, date });

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found for this date' });
    }

    // Update task completion
    const taskIndex = analytics.taskCompletions.findIndex(t => t.taskId === taskId);

    if (taskIndex !== -1) {
      analytics.taskCompletions[taskIndex].completed = completed;
      analytics.taskCompletions[taskIndex].completedAt = completed ? new Date() : null;
    }

    // Recalculate metrics
    analytics.completedTasks = analytics.taskCompletions.filter(t => t.completed).length;
    analytics.productivityScore = analytics.totalTasks > 0 ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0;

    await analytics.save();

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error updating task completion:', error);
    res.status(500).json({ error: 'Failed to update task completion' });
  }
});

app.delete('/api/analytics', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Delete all analytics for the user
    const result = await Analytics.deleteMany({ userId });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} analytics records`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error resetting analytics:', error);
    res.status(500).json({ error: 'Failed to reset analytics' });
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Samay Sahayak Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

function createCEOPrompt(randomPlan, userPreferences = {}) {
    const { energyLevel, preferredWorkoutTime } = userPreferences;

    return `You are an elite Executive Assistant, tasked with structuring the day for a high-performing CEO. Your goal is to transform a raw, unstructured brain-dump of tasks and feelings into a strategic, optimized, and actionable daily plan.

  **CEO's Brain-Dump:**
  "${randomPlan}"

  **CEO's State:**
  - Energy Level: ${energyLevel || 'not specified'}
  - Preferred Workout Time: ${preferredWorkoutTime || 'not specified'}

  **Your Task:**
  Analyze the brain-dump and create a structured, CEO-level daily schedule. Follow these principles:

  1.  **Prioritize ruthlessly:** Identify the "one big thing" for the day and allocate prime, focused time for it.
  2.  **Block time strategically:** Don't just list tasks. Create blocks of time for focused work, meetings, creative thinking, and personal tasks. Use time blocking.
  3.  **Manage energy, not just time:** Schedule high-focus, creative tasks when energy is likely to be highest (e.g., morning). Schedule administrative or less demanding tasks for lower energy periods (e.g., after lunch).
  4.  **Incorporate breaks and recovery:** A CEO's schedule is a marathon, not a sprint. Include strategic breaks for lunch, exercise, and short pauses to recharge.
  5.  **Be proactive:** If the CEO mentions a vague task like "prepare for presentation," break it down into actionable steps (e.g., "Review presentation draft," "Practice delivery," "Finalize slides").
  6.  **Add buffer time:** Do not schedule back-to-back meetings or tasks. Add 15-30 minute buffers to allow for travel, overruns, and context switching.
  7.  **Provide a "Daily Briefing":** At the top of the schedule, provide a 2-3 sentence summary of the day's primary goal and focus.

  **Output Format:**
  Return the response as a JSON object with the following structure:

  {
    "dailyBriefing": "A short summary of the day's main objective.",
    "dailySchedule": [
      {
        "time": "09:00 - 11:00",
        "activity": "Deep Work: Finalize Presentation",
        "type": "work",
        "description": "Two hours of uninterrupted focus to complete the presentation. All notifications off."
      }
    ],
    "recommendations": [
      "A list of strategic recommendations for the day."
    ]
  }
  `;
}

function createTimetablePrompt(tasks, technique, sessionConfig, userPreferences = {}) {
  const taskList = tasks.map(task =>
    `- ${task.title} (${task.estimatedDuration} min, ${task.priority} priority, ${task.category})`
  ).join('\n');

  const { dailyGoal, energyLevel, preferredWorkoutTime, preferredLearningTime, includeBreaks, includeMeals } = userPreferences;

  return `You are an expert productivity coach and AI assistant with deep understanding of human psychology, circadian rhythms, and optimal scheduling. Your mission is to create a highly efficient, realistic, and healthy daily timetable that maximizes the user's productivity and well-being.

USER CONTEXT:
${dailyGoal ? `Main Goal: ${dailyGoal}` : 'No specific goal mentioned'}
Energy Level: ${energyLevel || 'medium'}
Preferred Workout Time: ${preferredWorkoutTime || 'morning'}
Preferred Learning Time: ${preferredLearningTime || 'morning'}
Include Breaks: ${includeBreaks !== false ? 'Yes' : 'No'}
Include Meals: ${includeMeals !== false ? 'Yes' : 'No'}

TASKS TO SCHEDULE:
${taskList}

TECHNIQUE: ${technique.name}
${technique.description}

SESSION CONFIGURATION:
- Session Length: ${sessionConfig.sessionLength} minutes
- Break Length: ${sessionConfig.breakLength} minutes
- Work Hours: ${sessionConfig.startTime} - ${sessionConfig.endTime}
- Work Days: ${sessionConfig.workDays.join(', ')}

SCHEDULING PRINCIPLES TO FOLLOW:

1. **Common Sense & Context Awareness:**
   - Don't schedule outdoor activities (park, walk, exercise) during peak heat hours (12-3 PM)
   - Schedule exercise in morning or evening when temperatures are comfortable
   - Place high-priority tasks during peak energy hours (usually 9-11 AM)
   - Schedule creative tasks when energy is moderate
   - Place routine tasks during lower energy periods

2. **Energy Level Optimization:**
   - Low Energy: Shorter sessions, more breaks, gentle tasks first
   - Medium Energy: Balanced approach with mix of task types
   - High Energy: Longer sessions, tackle challenging tasks first

3. **Task Type Intelligence:**
   - Work/Professional: Schedule during business hours
   - Health/Exercise: Morning or evening, avoid peak heat
   - Learning/Reading: During preferred learning time or quiet hours
   - Personal: Flexible timing based on task nature
   - Creative: When energy is moderate to high

4. **Break Strategy:**
   - Short breaks (5-10 min) between work sessions
   - Longer breaks (15-30 min) every 2-3 hours
   - Lunch break around 12-1 PM
   - Use breaks for light stretching, hydration, or brief walks

5. **Priority Handling:**
   - High priority tasks get prime time slots
   - Medium priority tasks fill remaining time
   - Low priority tasks can be scheduled during lower energy periods

6. **Realistic Timing:**
   - Account for task transitions and setup time
   - Don't over-schedule - leave buffer time
   - Consider task complexity and mental load

INSTRUCTIONS:
1. Analyze the user's goal and energy level to determine optimal task placement
2. Apply common sense to outdoor activities and exercise timing
3. Respect the user's preferred times for specific activities
4. Create a balanced schedule that alternates between focused work and breaks
5. Ensure the schedule is realistic and achievable
6. Return the response in the following JSON format:

{
  "dailySchedule": [
    {
      "time": "09:00",
      "duration": 25,
      "activity": "Task Name",
      "type": "work|break|lunch|health|learning|personal",
      "description": "Brief description with reasoning",
      "priority": "high|medium|low",
      "category": "Work|Health|Learning|Personal"
    }
  ],
  "technique": "${technique.name}",
  "totalWorkTime": 480,
  "totalBreakTime": 60,
  "recommendations": [
    "Specific recommendation based on user's goal",
    "Energy management tip",
    "Productivity optimization suggestion"
  ],
  "scheduleInsights": {
    "peakProductivityTime": "9:00-11:00",
    "recommendedBreaks": "Every 90 minutes",
    "energyOptimization": "High priority tasks scheduled during peak hours"
  }
}

Make the schedule truly personalized and intelligent. Consider the user's specific context and create a timetable that will actually help them achieve their goals.`;
}

function parseTimetableResponse(response) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, create a basic structure
    return {
      dailySchedule: [],
      technique: "Custom",
      totalWorkTime: 0,
      totalBreakTime: 0,
      recommendations: ["Please review the AI response manually"],
      rawResponse: response
    };
  } catch (error) {
    console.error('Error parsing timetable response:', error);
    return {
      dailySchedule: [],
      technique: "Custom",
      totalWorkTime: 0,
      totalBreakTime: 0,
      recommendations: ["Error parsing AI response"],
      rawResponse: response
    };
  }
}