import React, { useEffect, useState } from "react";
import InputField from "../../components/input_field/InputField";
import SelectField from "../../components/input_field/SelectField";
import Button from "../../components/buttons/Button";
import {
  designationList,
  UserStatuses,
  program,
} from "../../constants/constants";
import { register, clearRegisterError } from "../../services/authSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import Profile from "../../components/profile_image/Profile";
import { useToast } from "../../hooks/useToast";
import VerifyOTP from "../Verification/VerifyOTP";

type RegisterProps = {
  isOpen: boolean;
  closeModal: () => void;
  toggleLoginModal: () => void;
};

const Register: React.FC<RegisterProps> = ({
  isOpen,
  closeModal,
  toggleLoginModal,
}) => {
  const toast = useToast();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showOTPModal, setShowOTPModal] = useState(false);

  const [form, setForm] = useState({
    image: null as File | null,
    firstname: "",
    lastname: "",
    middleInitial: "",
    email: "",
    designation: "",
    department: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: UserStatuses[0],
  });

  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.auth.registerError);

  useEffect(() => {
    return () => {
      dispatch(clearRegisterError());
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [dispatch, imagePreview]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };
      const matched = designationList.find(
        (d) => d.designation === updatedForm.designation
      );
      if (matched) updatedForm.role = matched.role;
      return updatedForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in form) {
      const value = form[key as keyof typeof form];
      if (value !== null) {
        formData.append(key, value);
      }
    }

    try {
      await dispatch(register(formData)).unwrap();
      toast.success(`OTP sent to ${form.email}`);
      setShowOTPModal(true);
    } catch (err) {
      toast.error(err as string);
      console.error("Registration failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showOTPModal ? (
        <VerifyOTP
          closeOTP={() => {
            closeModal();
            setShowOTPModal(false);
          }}
          email={form.email}
          closeModal={closeModal}
        />
      ) : (
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center bg-black/40">
          <div className="absolute top-2 p-4 w-full max-w-xl">
            <div className="relative bg-white rounded-lg shadow">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Create an Account
                </h3>
                <button
                  onClick={closeModal}
                  type="button"
                  className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                >
                  <svg
                    className="w-3 h-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-4 md:p-5">
                <form
                  encType="multipart/form-data"
                  onSubmit={handleSubmit}
                  className="space-y-4 w-full"
                >
                  <div className="flex justify-center items-center">
                    <Profile
                      setValue={(field, value) => {
                        setForm((prev) => ({ ...prev, [field]: value }));
                        if (field === "image" && value instanceof File) {
                          const url = URL.createObjectURL(value);
                          setImagePreview(url);
                        }
                      }}
                      image={imagePreview}
                    />
                  </div>

                  <div className="w-full m-0 flex sm:flex-row flex-col items-center justify-center sm:gap-2">
                    <div className="w-full">
                      <InputField
                        label="First Name"
                        id="firstname"
                        name="firstname"
                        value={form.firstname}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        error={error?.firstname?.[0] || ""}
                      />
                    </div>
                    <div className="w-full">
                      <InputField
                        label="Last Name"
                        id="lastname"
                        name="lastname"
                        value={form.lastname}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        error={error?.lastname?.[0] || ""}
                      />
                    </div>
                    <div className="w-full">
                      <InputField
                        label="Middle Initial"
                        id="middleInitial"
                        name="middleInitial"
                        value={form.middleInitial}
                        onChange={handleChange}
                        placeholder="Enter middle initial"
                        error={error?.middleInitial?.[0] || ""}
                      />
                    </div>
                  </div>

                  <InputField
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    error={error?.email?.[0] || ""}
                  />

                  <SelectField
                    label="Designation"
                    id="designation"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    error={error?.designation?.[0] || ""}
                    options={designationList?.map((designation) => ({
                      value: designation.designation,
                      label: designation.designation,
                    }))}
                  />

                  <SelectField
                    label="Program"
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    error={error?.department?.[0] || ""}
                    options={program?.map((program) => ({
                      value: program.programCode,
                      label: program.programName,
                    }))}
                  />

                  <InputField
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    error={error?.password?.[0] || ""}
                  />

                  <InputField
                    label="Confirm Password"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    error={error?.confirmPassword?.[0] || ""}
                  />

                  <Button
                    type="submit"
                    label="Register"
                    className="w-full"
                    onClick={handleSubmit}
                  />

                  <div className="text-sm font-medium text-gray-500 text-center">
                    Already have an account?{" "}
                    <a
                      onClick={toggleLoginModal}
                      href="#"
                      className="text-blue-700 hover:underline"
                    >
                      Login here
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

export default Register;
