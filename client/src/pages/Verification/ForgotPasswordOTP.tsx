import "./otp.css";
import sentImage from "../../assets/images/send-email.jpg";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import LoginLoading from "../../components/loader/LoginLoading";
import { useToast } from "../../hooks/useToast";
import "react-toastify/dist/ReactToastify.css";
import UpdatePassword from "../Auth/UpdatePassword";
import axios from "axios";

interface ForgotPasswordOTPProps {
  email: string;
  closeOTP: () => void;
  closeModal: (show: boolean) => void;
}

const ForgotPasswordOTP = ({
  email,
  closeOTP,
  closeModal,
}: ForgotPasswordOTPProps) => {
  const toast = useToast();
  const [countDown, setCountDown] = useState(0);
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUpdatePass, setShowUpdatePass] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        const nextInput = document.getElementById(
          `otp-input${index + 2}`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const data = {
      email,
      otp: otp.join(""),
    };

    try {
      const response = await api.post("/auth/verify-forgot-password", data, {
        withCredentials: true,
      });

      if (response.data.status === "success") {
        setShowUpdatePass(true);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Something went wrong"
        );
      } else {
        setErrorMessage("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await api.post("/auth/resend-otp", { email });
      if (response.data.status === "success") {
        toast.success(response.data.message);
        setCountDown(60);
        setErrorMessage("");
        setOtp(new Array(4).fill(""));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countDown > 0) {
      const timer = setTimeout(() => setCountDown(countDown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countDown]);

  const disableSubmit = otp.includes("") || otp.length < 4;

  return (
    <div
      id="default-modal"
      tabIndex={-1}
      className="fixed inset-0 z-50 px-5 flex items-center justify-center w-full h-full bg-black/40 font-normal"
    >
      {loading && <LoginLoading />}

      {showUpdatePass ? (
        <UpdatePassword
          closeOTP={closeOTP}
          email={email}
          closeModal={closeModal}
        />
      ) : (
        <form className="otp-Form" onSubmit={handleSubmit}>
          <span className="mainHeading">Enter OTP</span>
          <img src={sentImage} alt="Sent OTP" className="w-32" />
          <p className="otpSubheading">
            Please enter the 4 digit OTP sent to <span>{email}</span>
          </p>
          <div className="inputContainer">
            {otp.map((digit, index) => (
              <input
                key={index}
                required
                maxLength={1}
                type="text"
                className="otp-input"
                id={`otp-input${index + 1}`}
                value={digit}
                onChange={(e) => handleChange(e, index)}
              />
            ))}
          </div>
          {errorMessage && (
            <span className="text-red-600 text-sm">{errorMessage}</span>
          )}

          <button
            disabled={disableSubmit}
            className={`verifyButton ${
              disableSubmit ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            type="submit"
          >
            Verify
          </button>
          <button className="exitBtn" type="button" onClick={closeOTP}>
            ×
          </button>
          <p className="resendNote">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResend}
              className={`resendBtn ${
                countDown > 0 ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              type="button"
              disabled={countDown > 0}
            >
              {countDown > 0 ? `Resend code in ${countDown}s` : "Resend Code"}
            </button>
          </p>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordOTP;
