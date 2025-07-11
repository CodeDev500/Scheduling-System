import React, { createContext, useContext, type ReactNode } from "react";
import { ToastContainer, toast, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create a context with proper typing
const ToastContext = createContext<typeof toast | undefined>(undefined);

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Provider component with TypeScript types
type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <ToastContext.Provider value={toast}>
      <ToastContainer />
      {children}
    </ToastContext.Provider>
  );
};

// Optional utility function for simplified success/error usage
export const toastUtils = () => ({
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, options),
  error: (message: string, options?: ToastOptions) =>
    toast.error(message, options),
});
