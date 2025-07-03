import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "../api/axios";
import { isAxiosError } from "axios";
import Cookies from "js-cookie";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../types/types";

interface LoginProps {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  message?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Record<string, string[]> | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};
export const login = createAsyncThunk<
  LoginResponse,
  LoginProps,
  { rejectValue: Record<string, string[]> } // custom type for form errors
>("/auth/login", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<LoginResponse>("/auth/login", data);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
    }
    return rejectWithValue({ general: ["Login failed"] });
  }
});

export const fetchUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "/auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<User>("/protected", {
        withCredentials: true,
      });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Unauthorized");
      }
      return rejectWithValue("Unauthorized");
    }
  }
);

export const register = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: Record<string, string[]> }
>("/auth/register", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<User>("/auth/register", data);
    console.log(response.data);
    return response.data;
  } catch (error: unknown) {
    console.log(error);
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
    }
    return rejectWithValue({ general: ["Login failed"] });
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "/auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("/auth/logout");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Logout failed"
        );
      }
      return rejectWithValue("Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.error = null;
          if (action.payload.accessToken) {
            Cookies.set("accessToken", action.payload.accessToken);
          }
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { general: ["Login failed"] };
      })
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = { general: [action.payload || "Unauthorized"] };
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { general: ["Registration failed"] };
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
        Cookies.remove("accessToken");
      });
  },
});

export default authSlice.reducer;
