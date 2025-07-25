import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../services/authSlice";
import subjectReducer from "../services/subjectSlice";
import academicProgramReducer from "../services/academicProgramSlice";
import curriculumReducer from "../services/curriculumSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    subject: subjectReducer,
    academicProgram: academicProgramReducer,
    curriculum: curriculumReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
