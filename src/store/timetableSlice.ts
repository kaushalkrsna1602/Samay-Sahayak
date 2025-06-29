import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TimetableItem {
  time: string;
  duration: number;
  activity: string;
  type: 'work' | 'break' | 'lunch';
  description: string;
}

export interface TimetableData {
  date: string;
  dailySchedule: TimetableItem[];
  technique: string;
  totalWorkTime: number;
  totalBreakTime: number;
  recommendations: string[];
}

interface TimetableState {
  timetable: TimetableData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TimetableState = {
  timetable: null,
  isLoading: false,
  error: null,
};

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {
    setTimetable: (state, action: PayloadAction<TimetableData>) => {
      state.timetable = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearTimetable: (state) => {
      state.timetable = null;
      state.error = null;
    },
  },
});

export const { setTimetable, setLoading, setError, clearTimetable } = timetableSlice.actions;
export default timetableSlice.reducer; 