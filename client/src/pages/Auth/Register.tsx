import React, { useEffect, useState } from "react";
import InputField from "../../components/input_field/InputField";
import SelectField from "../../components/input_field/SelectField";
import MultiSelectField from "../../components/input_field/MultiSelectField";
import Button from "../../components/buttons/Button";
import {
  designationList,
  UserStatuses,
  program,
} from "../../constants/constants";
import { useSpecializations } from "../../hooks/useSpecializations";
import { register, clearRegisterError } from "../../services/authSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchSubjects } from "../../services/subjectSlice";
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
  const { specializations } = useSpecializations(true);
  const subjects = useAppSelector((state) => state.subject.subjects);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    image: null as File | null,
    firstname: "",
    lastname: "",
    middleInitial: "",
    email: "",
    designation: "",
    department: "",
    specialization: [] as string[],
    password: "",
    confirmPassword: "",
    role: "",
    status: UserStatuses[0],
    // New faculty fields
    previousSubjects: [] as string[],
    yearsOfExperience: 0,
    preferredTimeSlots: [] as string[],
    availableDays: [] as string[],
  });

  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.auth.registerError);

  // Fetch subjects when component mounts
  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // Display first error message if error is an object
      const errorMessage = typeof error === 'string' 
        ? error 
        : Object.values(error)[0]?.[0] || 'Registration failed';
      toast.error(errorMessage);
      dispatch(clearRegisterError());
    }
  }, [error, toast, dispatch]);

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

  const handleMultiSelectChange = (name: string, value: string[]) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    if (error) {
      dispatch(clearRegisterError());
    }

    setLoading(true);
    const formData = new FormData();
    for (const key in form) {
      const value = form[key as keyof typeof form];
      if (value !== null) {
        if (Array.isArray(value)) {
          // Handle array fields by converting to JSON string
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'string') {
          formData.append(key, value);
        } else if (typeof value === 'number') {
          formData.append(key, value.toString());
        }
      }
    }

    try {
      const res = await dispatch(register(formData)).unwrap();
      toast.success(res.message || "OTP sent to your email!");
      setShowOTPModal(true);
      // Clear any remaining errors on success
      dispatch(clearRegisterError());
    } catch (err) {
      toast.error(err as string);
      console.error("Registration failed:", err);
      // Don't reset form - keep user's data for correction
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* OTP Modal - Shows on top of register modal */}
      {showOTPModal ? (
        <VerifyOTP
          closeOTP={() => {
            setShowOTPModal(false);
            closeModal();
          }}
          email={form.email}
          closeModal={() => {
            setShowOTPModal(false);
            closeModal();
          }}
        />
        )
      : isOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center bg-black/40">
          <div className="absolute top-2 p-4 w-full max-w-2xl">
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

                  <MultiSelectField
                    label="Specialization"
                    id="specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleMultiSelectChange}
                    error={error?.specialization?.[0] || ""}
                    placeholder="Select your areas of specialization..."
                    options={specializations.length > 0 ? specializations.map((spec) => ({
                      value: spec,
                      label: spec,
                    })) : []}
                  />

                  {/* Faculty Availability Fields - Always show */}
                  <div className="w-full m-0 flex sm:flex-row flex-col items-center justify-center sm:gap-2">
                    <div className="w-full">
                      <InputField
                        label="Years of Experience"
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        value={form.yearsOfExperience}
                        onChange={(e) => setForm(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        error={error?.yearsOfExperience?.[0] || ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Preferred Time Range (7:00 AM - 7:00 PM)
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="time"
                          min="07:00"
                          max="20:00"
                          className="w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => {
                            const timeSlots = form.preferredTimeSlots.filter(slot => !slot.includes('start:'));
                            setForm(prev => ({ 
                              ...prev, 
                              preferredTimeSlots: [...timeSlots, `start:${e.target.value}`]
                            }));
                          }}
                        />
                      </div>
                      <span className="text-gray-500 mt-6">to</span>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="time"
                          min="07:00"
                          max="20:00"
                          className="w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => {
                            const timeSlots = form.preferredTimeSlots.filter(slot => !slot.includes('end:'));
                            setForm(prev => ({ 
                              ...prev, 
                              preferredTimeSlots: [...timeSlots, `end:${e.target.value}`]
                            }));
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Set your preferred teaching hours (e.g., 8:00 AM to 5:00 PM)
                    </p>
                    {error?.preferredTimeSlots?.[0] && (
                      <p className="text-xs text-red-500 mt-1">{error.preferredTimeSlots[0]}</p>
                    )}
                  </div>

                  <MultiSelectField
                    label="Available Days"
                    id="availableDays"
                    name="availableDays"
                    value={form.availableDays}
                    onChange={handleMultiSelectChange}
                    error={error?.availableDays?.[0] || ""}
                    placeholder="Select days you are available to teach..."
                    options={[
                      { value: "Monday", label: "Monday" },
                      { value: "Tuesday", label: "Tuesday" },
                      { value: "Wednesday", label: "Wednesday" },
                      { value: "Thursday", label: "Thursday" },
                      { value: "Friday", label: "Friday" },
                      { value: "Saturday", label: "Saturday" },
                      { value: "Sunday", label: "Sunday" },
                    ]}
                  />

                  <MultiSelectField
                    label="Previous Subjects Taught"
                    id="previousSubjects"
                    name="previousSubjects"
                    value={form.previousSubjects}
                    onChange={handleMultiSelectChange}
                    error={error?.previousSubjects?.[0] || ""}
                    placeholder="Select subjects you have previously taught..."
                    options={subjects.length > 0 ? subjects.map((subject) => ({
                      value: subject.subjectCode,
                      label: `${subject.subjectCode} - ${subject.subjectDescription}`,
                    })) : []}
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
                    isLoading={loading}
                    disabled={loading}
                    // onClick={handleSubmit}
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
      ) : null}
    </>
  );
};

export default Register;
