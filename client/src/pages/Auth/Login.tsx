import React, { useState } from "react";
import InputFiled from "../../components/input_field/InputField";
import Button from "../../components/buttons/Button";
import { login } from "../../services/authSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.auth.error);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { email, password };
    dispatch(login(data));

    if (!error) {
      navigate("/dashboard");
    }
  };
  return (
    <>
      {isOpen && (
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
                    <a
                      href="#"
                      className="text-sm text-blue-700 hover:underline "
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <Button
                    label="Login to your account"
                    type="submit"
                    className="w-full"
                    onClick={handleSubmit}
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
      )}
    </>
  );
};

export default Login;
