import type { ReactElement } from "react";

export type ArrayLink = {
  title: string;
  path: string;
  component: ReactElement;
};

export type LayoutHomeProps = {
  children: React.ReactNode;
};

export interface VerifyOTPProps {
  email: string;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  closeOTP: () => void;
  errorMessage?: string;
  loading?: boolean;
}

export interface User {
  id: number;
  image: string;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
