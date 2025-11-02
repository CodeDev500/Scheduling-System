import axios from "../api/axios";
import { isAxiosError } from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { CurriculumCourse } from "../types/types";

interface CurriculumState {
  curriculums: CurriculumCourse[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CurriculumState = {
  curriculums: [] as CurriculumCourse[],
  isLoading: false,
  error: null,
};

export const fetchCurriculums = createAsyncThunk(
  "curriculum/getCurriculums",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/curriculum");
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching curriculums:", error);
      if (isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
        if (error.response?.status === 401) {
          return rejectWithValue("Authentication required. Please log in.");
        }
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message || "Failed to fetch curriculums");
      }
      return rejectWithValue("Error fetching curriculums");
    }
  }
);

export const createCurriculum = createAsyncThunk<
  CurriculumCourse,
  Omit<CurriculumCourse, "id">,
  { rejectValue: string }
>("curriculum/createCurriculum", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post("/curriculum/add", data);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message);
    }
    return rejectWithValue("Error creating curriculum");
  }
});

export const updateCurriculum = createAsyncThunk<
  CurriculumCourse,
  { id: number; data: CurriculumCourse },
  { rejectValue: string }
>("curriculum/updateCurriculum", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/curriculum/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message);
    }
    return rejectWithValue("Error updating curriculum");
  }
});

export const deleteCurriculum = createAsyncThunk<
  CurriculumCourse,
  number,
  { rejectValue: string }
>("curriculum/deleteCurriculum", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/curriculum/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message);
    }
    return rejectWithValue("Error deleting curriculum");
  }
});

export const fetchCurriculumByProgramAndYear = createAsyncThunk(
  "curriculum/fetchCurriculumByProgramAndYear",
  async ({ programCode, yearLevel }: { programCode: string; yearLevel: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/curriculum/filter/${programCode}/${yearLevel}`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error fetching curriculum by program and year");
    }
  }
);

export const fetchCurriculumCoursesWithFilters = createAsyncThunk(
  "curriculum/fetchCurriculumCoursesWithFilters",
  async ({ programCode, yearLevel = "all", semester = "all" }: { programCode: string; yearLevel?: string; semester?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (semester !== "all") {
        params.append("semester", semester);
      }
      
      const queryString = params.toString();
      const url = `/curriculum/search/${programCode}/${yearLevel}${queryString ? `?${queryString}` : ""}`;
      console.log(programCode, yearLevel, semester)
      
      const response = await axios.get(url);
      console.log(response.data)
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error fetching curriculum courses with filters");
    }
  }
);

export const CurriculumSlice = createSlice({
  name: "curriculum",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurriculums.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurriculums.fulfilled, (state, action) => {
        state.isLoading = false;
        state.curriculums = action.payload;
      })
      .addCase(fetchCurriculums.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurriculumByProgramAndYear.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurriculumByProgramAndYear.fulfilled, (state, action) => {
        state.isLoading = false;
        state.curriculums = action.payload;
      })
      .addCase(fetchCurriculumByProgramAndYear.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurriculumCoursesWithFilters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurriculumCoursesWithFilters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.curriculums = action.payload;
      })
      .addCase(fetchCurriculumCoursesWithFilters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createCurriculum.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCurriculum.fulfilled, (state, action) => {
        state.isLoading = false;
        // The payload should contain the created/updated curriculum data
        // Since we're saving multiple subjects, we don't add to state here
        // The fetchCurriculumByProgramAndYear will reload the data
      })
      .addCase(createCurriculum.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default CurriculumSlice.reducer;
