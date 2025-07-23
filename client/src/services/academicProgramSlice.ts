import axios from "../api/axios";
import { isAxiosError } from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AcademicProgram } from "../types/types";

const initialState = {
  academicPrograms: [] as AcademicProgram[],
  isLoading: false,
  error: null as string | null,
};

export const fetchAcademicPrograms = createAsyncThunk(
  "academicProgram/getAcademicPrograms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/program");
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error fetching academic programs");
    }
  }
);

export const createAcademicProgram = createAsyncThunk<
  AcademicProgram,
  Omit<AcademicProgram, "id">,
  { rejectValue: string }
>(
  "academicProgram/createAcademicProgram",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/program", data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error creating academic program");
    }
  }
);

export const updateAcademicProgram = createAsyncThunk<
  AcademicProgram,
  { id: number; data: AcademicProgram },
  { rejectValue: string }
>(
  "academicProgram/updateAcademicProgram",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/program/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error updating academic program");
    }
  }
);

export const deleteAcademicProgram = createAsyncThunk<
  AcademicProgram,
  number,
  { rejectValue: string }
>("academicProgram/deleteAcademicProgram", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/program/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message);
    }
    return rejectWithValue("Error deleting academic program");
  }
});

export const AcademicProgramSlice = createSlice({
  name: "academicProgram",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcademicPrograms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAcademicPrograms.fulfilled, (state, action) => {
        state.academicPrograms = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAcademicPrograms.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(createAcademicProgram.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAcademicProgram.fulfilled, (state, action) => {
        state.academicPrograms.push(action.payload);
        state.isLoading = false;
      })
      .addCase(createAcademicProgram.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(updateAcademicProgram.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAcademicProgram.fulfilled, (state, action) => {
        state.academicPrograms = state.academicPrograms.map((program) => {
          if (program.id === action.payload.id) {
            return action.payload;
          }
          return program;
        });
        state.isLoading = false;
      })
      .addCase(updateAcademicProgram.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(deleteAcademicProgram.fulfilled, (state, action) => {
        state.academicPrograms = state.academicPrograms.filter(
          (program) => program.id !== action.payload.id
        );
      });
  },
});

export default AcademicProgramSlice.reducer;
