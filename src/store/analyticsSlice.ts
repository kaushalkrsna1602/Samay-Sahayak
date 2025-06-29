import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProductivityMetrics {
  totalTasksCompleted: number;
  totalWorkTime: number;
  totalBreakTime: number;
  averageSessionLength: number;
  completionRate: number;
  mostProductiveTime: string;
  mostUsedTechnique: string;
}

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  totalWorkTime: number;
  technique: string;
  energyLevel: string;
  goal: string;
}

export interface AnalyticsState {
  metrics: ProductivityMetrics;
  dailyStats: DailyStats[];
  weeklyGoal: number;
  currentStreak: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  metrics: {
    totalTasksCompleted: 0,
    totalWorkTime: 0,
    totalBreakTime: 0,
    averageSessionLength: 0,
    completionRate: 0,
    mostProductiveTime: 'morning',
    mostUsedTechnique: 'Pomodoro'
  },
  dailyStats: [],
  weeklyGoal: 5,
  currentStreak: 0,
  isLoading: false,
  error: null
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateMetrics: (state, action: PayloadAction<Partial<ProductivityMetrics>>) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    addDailyStats: (state, action: PayloadAction<DailyStats>) => {
      state.dailyStats.push(action.payload);
    },
    setWeeklyGoal: (state, action: PayloadAction<number>) => {
      state.weeklyGoal = action.payload;
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      state.currentStreak = action.payload;
    },
    resetAnalytics: (state) => {
      state.metrics = initialState.metrics;
      state.dailyStats = [];
      state.currentStreak = 0;
    }
  }
});

export const {
  setLoading,
  setError,
  updateMetrics,
  addDailyStats,
  setWeeklyGoal,
  updateStreak,
  resetAnalytics
} = analyticsSlice.actions;

export default analyticsSlice.reducer; 