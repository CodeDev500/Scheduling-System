import { useState } from "react";
import api from "../../api/axios";
import LoginLoading from "../../components/loader/LoginLoading";
import { useToast } from "../../hooks/useToast";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { useForm } from "react-hook-form";

interface UpdatePasswordProps {
  closeOTP: (show: boolean) => void;
  email: string;
  closeModal: (show: boolean) => void;
}

interface FormValues {
  password: string;
  confirmPassword: string;
}

const UpdatePassword = ({
  closeOTP,
  email,
  closeModal,
}: UpdatePasswordProps) => {
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const passwordValue = watch("password");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const response = await api.put("/auth/reset-password", {
        email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.data.status === "success") {
        toast.success(response.data.message);
        closeOTP(false);
        closeModal(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="default-modal"
      tabIndex={-1}
      className="fixed inset-0 z-50 px-5 flex items-center justify-center w-full h-full bg-black/20 font-normal"
    >
      {isLoading && <LoginLoading />}
      <div className="relative w-full max-w-lg max-h-full">
        <div className="relative text-gray-800 bg-white rounded-xl shadow-lg">
          <div className="p-6 py-8 space-y-4 text-sm text-[#221f1f]">
            <div className="flex gap-5 rounded-t">
              <button
                onClick={() => closeOTP(false)}
                className="text-2xl font-bold"
              >
                <IoMdArrowRoundBack />
              </button>
              <h1 className="md:text-2xl font-bold text-lg">New Password</h1>
            </div>
            <h3 className="text-sm md:text-[16px] text-gray-700">
              Please enter your new password below
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Password Field */}
              <label
                htmlFor="password"
                className="block mb-2 mt-4 text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <div className="flex relative">
                <span className="absolute h-full inline-flex items-center px-3 text-sm text-gray-900">
                  {/* lock icon */}
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a4 4 0 00-4 4v4H5a3 3 0 00-3 3v5a3 3 0 003 3h10a3 3 0 003-3v-5a3 3 0 00-3-3h-1V6a4 4 0 00-4-4zm-3 6V6a3 3 0 016 0v4H7zm3 4a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter password"
                  className={`rounded-lg pl-12 bg-gray-50 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } text-gray-900 focus:ring-blue-500 focus:border-blue-100 block w-full text-sm p-2.5`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: (value) =>
                      value.trim().length >= 8 ||
                      "Password must be at least 8 characters",
                  })}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-lg m-3 text-gray-700 cursor-pointer"
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}

              {/* Confirm Password Field */}
              <label
                htmlFor="confirmPassword"
                className="block mb-2 mt-4 text-sm font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <div className="flex relative">
                <span className="absolute h-full inline-flex items-center px-3 text-sm text-gray-900">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a4 4 0 00-4 4v4H5a3 3 0 00-3 3v5a3 3 0 003 3h10a3 3 0 003-3v-5a3 3 0 00-3-3h-1V6a4 4 0 00-4-4zm-3 6V6a3 3 0 016 0v4H7zm3 4a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm password"
                  className={`rounded-lg pl-12 bg-gray-50 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } text-gray-900 focus:ring-blue-500 focus:border-blue-100 block w-full text-sm p-2.5`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-lg m-3 text-gray-700 cursor-pointer"
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-6 p-2 bg-primary hover:bg-rose-600 text-white text-sm md:text-lg rounded-lg ${
                  isLoading ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
