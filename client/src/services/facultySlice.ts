import axios from "../api/axios";
import { isAxiosError } from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../types/types";

interface FacultySubject {
  id: number;
  subjectCode: string;
  subjectDescription: string;
  lec: number;
  lab: number;
  units: number;
}

interface FacultyWithSubjects extends User {
  subjects: FacultySubject[];
}

const initialState = {
  faculty: [] as FacultyWithSubjects[],
  isLoading: false,
  error: null as string | null,
};

// Fetch all faculty with their assigned subjects
export const fetchFacultyWithSubjects = createAsyncThunk(
  "faculty/getFacultyWithSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/user-subject/faculty-subjects");
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error fetching faculty with subjects");
    }
  }
);

// Fetch faculty by department
export const fetchFacultyByDepartment = createAsyncThunk(
  "faculty/getFacultyByDepartment",
  async (department: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/user/faculty/department/${department}`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error fetching faculty by department");
    }
  }
);

// Assign subject to faculty
export const assignSubjectToFaculty = createAsyncThunk<
  any,
  { userId: number; subjectId: number },
  { rejectValue: string }
>(
  "faculty/assignSubject",
  async ({ userId, subjectId }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/user-subject/assign", {
        userId,
        subjectId,
      });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error assigning subject to faculty");
    }
  }
);

// Remove subject from faculty
export const removeSubjectFromFaculty = createAsyncThunk<
  any,
  { userId: number; subjectId: number },
  { rejectValue: string }
>(
  "faculty/removeSubject",
  async ({ userId, subjectId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `/user-subject/user/${userId}/subject/${subjectId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error removing subject from faculty");
    }
  }
);

export const FacultySlice = createSlice({
  name: "faculty",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch faculty with subjects
      .addCase(fetchFacultyWithSubjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacultyWithSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.faculty = action.payload;
      })
      .addCase(fetchFacultyWithSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch faculty by department
      .addCase(fetchFacultyByDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacultyByDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.faculty = action.payload;
      })
      .addCase(fetchFacultyByDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Assign subject to faculty
      .addCase(assignSubjectToFaculty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignSubjectToFaculty.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(assignSubjectToFaculty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove subject from faculty
      .addCase(removeSubjectFromFaculty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeSubjectFromFaculty.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(removeSubjectFromFaculty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default FacultySlice.reducer;