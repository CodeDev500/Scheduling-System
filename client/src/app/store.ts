import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../services/authSlice";
import subjectReducer from "../services/subjectSlice";
import academicProgramReducer from "../services/academicProgramSlice";
import curriculumReducer from "../services/curriculumSlice";
import facultyReducer from "../services/facultySlice";
import programPriorityReducer from "../services/programPrioritySlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    subject: subjectReducer,
    academicProgram: academicProgramReducer,
    curriculum: curriculumReducer,
    faculty: facultyReducer,
    programPriority: programPriorityReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
