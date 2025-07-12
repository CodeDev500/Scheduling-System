import React, { useState, useEffect } from "react";
import InputFiled from "../../components/input_field/InputField";
import Button from "../../components/buttons/Button";
import { login, clearLoginError } from "../../services/authSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import ForgotPassword from "./ForgotPassword";
import { UserRoles } from "../../constants/constants";
type LoginProps = {
  isOpen: boolean;
  closeModal: () => void;
  toggleRegisterModal: () => void;
};
const Login: React.FC<LoginProps> = ({
  isOpen,
  closeModal,
  toggleRegisterModal,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.auth.loginError);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearLoginError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = { email, password };

    try {
      const response = await dispatch(login(data)).unwrap();
      toast.success("Login successful");
      let path: string = "";
      if (response.user.role === UserRoles[0]) {
        path = "/faculty-dashboard";
      } else if (response.user.role === UserRoles[1]) {
        path = "/department-head-dashboard";
      } else if (response.user.role === UserRoles[2]) {
        path = "/registrar-dashboard";
      } else {
        path = "/admin-dashboard";
      }
      setTimeout(() => {
        navigate(path);
      }, 500);
    } catch (err) {
      toast.error(err as string);
      setLoading(false);
      console.error("Login failed:", err);
    }
  };

  return (
    <>
      {forgotPassword ? (
        <ForgotPassword closeModal={() => setForgotPassword(false)} />
      ) : (
        isOpen && (
          <div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 overflow-y-auto"
            aria-hidden={!isOpen}
            tabIndex={-1}
          >
            <div className="relative p-4 w-full max-w-md">
              <div className="relative bg-white rounded-lg shadow ">
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200 ">
                  <h3 className="text-xl font-semibold text-gray-900 ">
                    Sign in to your account
                  </h3>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center "
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 md:p-5">
                  <form className="space-y-4">
                    <InputFiled
                      label="Email"
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      error={error?.email?.[0] || ""}
                      // required
                    />
                    <InputFiled
                      label="Password"
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      error={error?.password?.[0] || ""}
                      // required
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => setForgotPassword(true)}
                        type="button"
                        className="text-sm text-blue-700 hover:underline "
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <Button
                      label="Login to your account"
                      type="submit"
                      className="w-full"
                      onClick={handleSubmit}
                      isLoading={loading}
                      disabled={loading}
                    />
                    {/* <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={() => alert("Cancelled")}
                  />
                  <Button label="Delete" variant="danger" />
                  <Button label="Disabled" disabled /> */}
                    <div className="text-sm font-medium text-gray-500 ">
                      Not registered?{" "}
                      <a
                        onClick={toggleRegisterModal}
                        href="#"
                        className="text-blue-700 hover:underline "
                      >
                        Create account
                      </a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default Login;
