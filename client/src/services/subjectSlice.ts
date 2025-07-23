import axios from "../api/axios";
import { isAxiosError } from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { SubjectTypes } from "../types/types";

const initialState = {
  subjects: [] as SubjectTypes[],
  isLoading: false,
  error: null as string | null,
};

export const fetchSubjects = createAsyncThunk(
  "subject/getSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/subject");
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error fetching subjects");
    }
  }
);

export const deleteSubject = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("subject/deleteSubject", async (id: number, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/subject/${id}`);
    return response.data.id;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message);
    }
    return rejectWithValue("Error deleting subject");
  }
});

export const createSubject = createAsyncThunk<
  SubjectTypes,
  Omit<SubjectTypes, "id">,
  { rejectValue: string }
>(
  "subject/createSubject",
  async (data: Omit<SubjectTypes, "id">, { rejectWithValue }) => {
    try {
      const response = await axios.post("/subject", data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.data?.errors) {
          return rejectWithValue(error.response.data.errors);
        }
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Error creating subject");
    }
  }
);

export const updateSubject = createAsyncThunk<
  SubjectTypes,
  { id: number; data: SubjectTypes },
  { rejectValue: string }
>("subject/updateSubject", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/subject/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message);
    }
    return rejectWithValue("Error updating subject");
  }
});

export const searchSubject = createAsyncThunk<
  SubjectTypes[],
  string,
  { rejectValue: string }
>("subject/searchSubject", async (query: string, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/subject/search/${query}`);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message);
    }
    return rejectWithValue("Error searching subject");
  }
});

export const SubjectSlice = createSlice({
  name: "subject",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSubject.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.filter(
          (subject) => subject.id !== action.payload
        );
      })

      .addCase(createSubject.pending, (state) => {
        state.error = null;
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.subjects.push(action.payload);
      })

      .addCase(updateSubject.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.map((subject) => {
          if (subject.id === action.payload.id) {
            return action.payload;
          }
          return subject;
        });
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(searchSubject.pending, (state) => {
        state.error = null;
      })
      .addCase(searchSubject.fulfilled, (state, action) => {
        state.subjects = action.payload;
      })
      .addCase(searchSubject.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default SubjectSlice.reducer;
