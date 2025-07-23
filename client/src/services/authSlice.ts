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
  loginError: Record<string, string[]> | null;
  registerError: Record<string, string[]> | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  loginError: null,
  registerError: null,
};
export const login = createAsyncThunk<
  LoginResponse,
  LoginProps,
  { rejectValue: Record<string, string[]> | string }
>("/auth/login", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<LoginResponse>("/auth/login", data);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
    return rejectWithValue("Login failed");
  }
});

export const fetchUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "/auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ user: User; message: string }>(
        "/protected",
        {
          withCredentials: true,
        }
      );
      return response.data.user;
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
  FormData, // 🔄 changed from Partial<User> to FormData
  { rejectValue: Record<string, string[]> }
>("/auth/register", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<User>("/auth/register", data, {
      headers: {
        "Content-Type": "multipart/form-data", // ✅ important for file upload
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.data?.errors) {
        return rejectWithValue(error.response.data.errors);
      }
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
    console.log(error);
    return rejectWithValue({ general: ["Registration failed"] });
  }
});

export const logout = createAsyncThunk("/auth/logout", async () => {
  try {
    const response = await axios.post("/auth/logout");
    return response.data;
  } catch (error: unknown) {
    console.error(error);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearRegisterError: (state) => {
      state.registerError = null;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.loginError = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.loginError = null;
          if (action.payload.accessToken) {
            Cookies.set("accessToken", action.payload.accessToken);
          }
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload as Record<string, string[]>;
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
        state.registerError = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.registerError = action.payload || {
          general: ["Registration failed"],
        };
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.registerError = null;
        Cookies.remove("accessToken");
      });
  },
});

export const { clearRegisterError, clearLoginError } = authSlice.actions;
export default authSlice.reducer;
