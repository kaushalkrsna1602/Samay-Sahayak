import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Technique {
  id: string;
  name: string;
  description: string;
  defaultSessionLength: number;
  defaultBreakLength: number;
  color: string;
}

export interface SessionConfig {
  techniqueId: string;
  sessionLength: number;
  breakLength: number;
  workDays: string[];
  startTime: string;
  endTime: string;
}

interface TechniqueState {
  techniques: Technique[];
  selectedTechnique: string | null;
  sessionConfig: SessionConfig | null;
}

const initialState: TechniqueState = {
  techniques: [
    {
      id: 'pomodoro',
      name: 'Pomodoro Technique',
      description: 'Work for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-30 minute break.',
      defaultSessionLength: 25,
      defaultBreakLength: 5,
      color: '#ef4444',
    },
    {
      id: 'time-blocking',
      name: 'Time Blocking',
      description: 'Allocate specific time blocks for different tasks and activities throughout your day.',
      defaultSessionLength: 60,
      defaultBreakLength: 15,
      color: '#3b82f6',
    },
    {
      id: 'timeboxing',
      name: 'Timeboxing',
      description: 'Set strict time limits for tasks to increase focus and prevent over-engineering.',
      defaultSessionLength: 45,
      defaultBreakLength: 10,
      color: '#10b981',
    },
    {
      id: 'eat-that-frog',
      name: 'Eat That Frog',
      description: 'Tackle your most challenging task first thing in the morning.',
      defaultSessionLength: 90,
      defaultBreakLength: 20,
      color: '#f59e0b',
    },
    {
      id: '52-17',
      name: '52/17 Rule',
      description: 'Work for 52 minutes, then take a 17-minute break to maintain peak productivity.',
      defaultSessionLength: 52,
      defaultBreakLength: 17,
      color: '#8b5cf6',
    },
  ],
  selectedTechnique: null,
  sessionConfig: null,
};

const techniqueSlice = createSlice({
  name: 'technique',
  initialState,
  reducers: {
    selectTechnique: (state, action: PayloadAction<string>) => {
      state.selectedTechnique = action.payload;
      const technique = state.techniques.find(t => t.id === action.payload);
      if (technique) {
        state.sessionConfig = {
          techniqueId: technique.id,
          sessionLength: technique.defaultSessionLength,
          breakLength: technique.defaultBreakLength,
          workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '09:00',
          endTime: '17:00',
        };
      }
    },
    updateSessionConfig: (state, action: PayloadAction<Partial<SessionConfig>>) => {
      if (state.sessionConfig) {
        state.sessionConfig = { ...state.sessionConfig, ...action.payload };
      }
    },
    resetTechnique: (state) => {
      state.selectedTechnique = null;
      state.sessionConfig = null;
    },
  },
});

export const { selectTechnique, updateSessionConfig, resetTechnique } = techniqueSlice.actions;
export default techniqueSlice.reducer; 