import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import sentImage from "../../assets/images/send-email.jpg";
import "./otp.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toastUtils } from "../../hooks/useToast";

interface VerifyOTPProps {
  email: string;
  closeOTP: () => void;
  closeModal: () => void;
}

const VerifyOTP: React.FC<VerifyOTPProps> = ({ email, closeOTP }) => {
  const toast = toastUtils();
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
  const [countDown, setCountDown] = useState<number>(0);
  // const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-input${index + 2}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setErrorMessage("");
    setLoading(true);
    e.preventDefault();

    const data = {
      email,
      otp: otp.join(""),
    };

    try {
      const response = await api.post("/auth/verify-otp", data);
      if (response.status === 200) {
        setLoading(false);
        closeOTP();
        toast.success(response.data.message);
        // navigate("/auth/login");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMessage(error?.response.data.message);
      console.error("Registration failed:", error);
    }
  };

  const handleResend = () => {
    setCountDown(60);
    setOtp(new Array(4).fill(""));
  };

  useEffect(() => {
    if (countDown > 0) {
      const timer = setTimeout(() => setCountDown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countDown]);

  const disableSubmit = otp.includes("") || otp.length < 4;

  return (
    <div className="fixed inset-0 z-50 px-5 flex items-center justify-center w-full h-full bg-black/40 font-normal">
      {loading && <div className="absolute">Loading...</div>}

      <form className="otp-Form" onSubmit={handleSubmit}>
        <span className="mainHeading">Enter OTP</span>
        <img src={sentImage} alt="Sent email" className="w-32" />
        <p className="otpSubheading">
          Please enter the 4-digit OTP sent to <span>{email}</span>
        </p>

        <div className="inputContainer">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input${index + 1}`}
              maxLength={1}
              required
              type="text"
              className="otp-input"
              value={digit}
              onChange={(e) => handleChange(e, index)}
            />
          ))}
        </div>

        {errorMessage && (
          <span className="text-red-600 text-sm">{errorMessage}</span>
        )}

        <button
          type="submit"
          className={`verifyButton ${
            disableSubmit ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          disabled={disableSubmit}
        >
          Verify
        </button>

        <button className="exitBtn" type="button" onClick={closeOTP}>
          ×
        </button>

        <p className="resendNote">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className={`resendBtn ${
              countDown > 0 ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            disabled={countDown > 0}
          >
            {countDown > 0 ? `Resend code in ${countDown}s` : "Resend Code"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default VerifyOTP;
