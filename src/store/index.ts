import { configureStore } from '@reduxjs/toolkit';
import techniqueReducer from './techniqueSlice';
import taskReducer from './taskSlice';
import timetableReducer from './timetableSlice';
import analyticsReducer from './analyticsSlice';
import templateReducer from './templateSlice';

export const store = configureStore({
  reducer: {
    technique: techniqueReducer,
    tasks: taskReducer,
    timetable: timetableReducer,
    analytics: analyticsReducer,
    templates: templateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 