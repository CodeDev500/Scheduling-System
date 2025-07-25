import axios from "../api/axios";
import { isAxiosError } from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { CurriculumCourse, SubjectData } from "../types/types";

interface CurriculumState {
  curriculums: SubjectData[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CurriculumState = {
  curriculums: [],
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
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
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
      });
  },
});

export default CurriculumSlice.reducer;
