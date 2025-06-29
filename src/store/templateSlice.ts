import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TimetableTemplate {
  id: string;
  name: string;
  description: string;
  technique: string;
  sessionConfig: {
    sessionLength: number;
    breakLength: number;
    startTime: string;
    endTime: string;
    workDays: string[];
  };
  userPreferences: {
    dailyGoal: string;
    energyLevel: 'low' | 'medium' | 'high';
    preferredWorkoutTime: 'morning' | 'afternoon' | 'evening' | 'none';
    preferredLearningTime: 'morning' | 'afternoon' | 'evening' | 'none';
    includeBreaks: boolean;
    includeMeals: boolean;
  };
  taskTemplates: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedDuration: number;
    category: string;
  }>;
  createdAt: string;
  isDefault?: boolean;
}

export interface TemplateState {
  templates: TimetableTemplate[];
  selectedTemplate: TimetableTemplate | null;
  isLoading: boolean;
  error: string | null;
}

const defaultTemplates: TimetableTemplate[] = [
  {
    id: 'morning-person',
    name: 'Morning Person',
    description: 'Optimized for early risers who are most productive in the morning',
    technique: 'Pomodoro',
    sessionConfig: {
      sessionLength: 25,
      breakLength: 5,
      startTime: '06:00',
      endTime: '18:00',
      workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    userPreferences: {
      dailyGoal: 'Maximize morning productivity',
      energyLevel: 'high',
      preferredWorkoutTime: 'morning',
      preferredLearningTime: 'morning',
      includeBreaks: true,
      includeMeals: true
    },
    taskTemplates: [
      {
        title: 'Morning Exercise',
        description: 'Start the day with physical activity',
        priority: 'high',
        estimatedDuration: 30,
        category: 'Health'
      },
      {
        title: 'Deep Work Session',
        description: 'Focus on most important tasks',
        priority: 'high',
        estimatedDuration: 90,
        category: 'Work'
      }
    ],
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Perfect for those who work best in the evening hours',
    technique: 'Time Blocking',
    sessionConfig: {
      sessionLength: 45,
      breakLength: 15,
      startTime: '10:00',
      endTime: '22:00',
      workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    userPreferences: {
      dailyGoal: 'Optimize evening productivity',
      energyLevel: 'medium',
      preferredWorkoutTime: 'evening',
      preferredLearningTime: 'evening',
      includeBreaks: true,
      includeMeals: true
    },
    taskTemplates: [
      {
        title: 'Creative Work',
        description: 'Evening creative sessions',
        priority: 'high',
        estimatedDuration: 60,
        category: 'Creative'
      },
      {
        title: 'Evening Exercise',
        description: 'Workout session',
        priority: 'medium',
        estimatedDuration: 45,
        category: 'Health'
      }
    ],
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'balanced-day',
    name: 'Balanced Day',
    description: 'Well-rounded schedule for consistent productivity',
    technique: '52/17 Rule',
    sessionConfig: {
      sessionLength: 52,
      breakLength: 17,
      startTime: '08:00',
      endTime: '17:00',
      workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    userPreferences: {
      dailyGoal: 'Maintain steady productivity throughout the day',
      energyLevel: 'medium',
      preferredWorkoutTime: 'afternoon',
      preferredLearningTime: 'morning',
      includeBreaks: true,
      includeMeals: true
    },
    taskTemplates: [
      {
        title: 'Morning Planning',
        description: 'Plan and organize the day',
        priority: 'high',
        estimatedDuration: 30,
        category: 'Planning'
      },
      {
        title: 'Core Work',
        description: 'Main work tasks',
        priority: 'high',
        estimatedDuration: 120,
        category: 'Work'
      }
    ],
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

const initialState: TemplateState = {
  templates: defaultTemplates,
  selectedTemplate: null,
  isLoading: false,
  error: null
};

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTemplate: (state, action: PayloadAction<TimetableTemplate>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<{ id: string; updates: Partial<TimetableTemplate> }>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = { ...state.templates[index], ...action.payload.updates };
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },
    selectTemplate: (state, action: PayloadAction<TimetableTemplate | null>) => {
      state.selectedTemplate = action.payload;
    },
    loadTemplate: (state, action: PayloadAction<string>) => {
      const template = state.templates.find(t => t.id === action.payload);
      state.selectedTemplate = template || null;
    }
  }
});

export const {
  setLoading,
  setError,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  selectTemplate,
  loadTemplate
} = templateSlice.actions;

export default templateSlice.reducer; 