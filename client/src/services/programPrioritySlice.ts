import axios from "../api/axios";
import { isAxiosError } from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ProgramPriority {
  id: number;
  programCode: string;
  programName: string;
  priority: number;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgramPriorityState {
  programPriorities: ProgramPriority[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProgramPriorityState = {
  programPriorities: [],
  isLoading: false,
  error: null,
};

// Fetch all program priorities
export const fetchProgramPriorities = createAsyncThunk(
  "programPriority/fetchProgramPriorities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/program-priorities");
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error fetching program priorities");
    }
  }
);

// Save program priorities (bulk save)
export const saveProgramPriorities = createAsyncThunk<
  ProgramPriority[],
  { programCode: string; programName: string; priority: number; department?: string }[],
  { rejectValue: string }
>(
  "programPriority/saveProgramPriorities",
  async (priorities, { rejectWithValue }) => {
    try {
      const response = await axios.post("/program-priorities/save", { priorities });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error saving program priorities");
    }
  }
);

// Update a single program priority
export const updateProgramPriority = createAsyncThunk<
  ProgramPriority,
  { id: number; priority: number },
  { rejectValue: string }
>(
  "programPriority/updateProgramPriority",
  async ({ id, priority }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/program-priorities/${id}`, { priority });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error updating program priority");
    }
  }
);

// Delete a program priority
export const deleteProgramPriority = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "programPriority/deleteProgramPriority",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/program-priorities/${id}`);
      return id;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error deleting program priority");
    }
  }
);

const programPrioritySlice = createSlice({
  name: "programPriority",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch program priorities
      .addCase(fetchProgramPriorities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgramPriorities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programPriorities = action.payload;
      })
      .addCase(fetchProgramPriorities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save program priorities
      .addCase(saveProgramPriorities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveProgramPriorities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programPriorities = action.payload;
      })
      .addCase(saveProgramPriorities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update program priority
      .addCase(updateProgramPriority.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProgramPriority.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.programPriorities.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.programPriorities[index] = action.payload;
        }
      })
      .addCase(updateProgramPriority.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete program priority
      .addCase(deleteProgramPriority.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProgramPriority.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programPriorities = state.programPriorities.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProgramPriority.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = programPrioritySlice.actions;
export default programPrioritySlice.reducer;
export type { ProgramPriority };