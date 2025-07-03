import React, { useState } from "react";
import InputFiled from "../../components/input_field/InputFiled";
import Button from "../../components/buttons/Button";

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
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    middleInitial: "",
    email: "",
    designation: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value) newErrors[key] = `${key} is required`;
    });

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted", form);
      // Submit to API here
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center bg-black/40"
          aria-hidden={!isOpen}
          tabIndex={-1}
        >
          <div className="absolute top-2 p-4 w-full max-w-xl ">
            <div className="relative bg-white rounded-lg shadow">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200 ">
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
                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                  <div className="w-full m-0 flex sm:flex-row flex-col items-center justify-center sm:gap-2">
                    <div className="w-full">
                      <InputFiled
                        label="First Name"
                        id="firstname"
                        name="firstname"
                        value={form.firstname}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        error={errors.firstname}
                      />
                    </div>

                    <div className="w-full">
                      {" "}
                      <InputFiled
                        label="Last Name"
                        id="lastname"
                        name="lastname"
                        value={form.lastname}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        error={errors.lastname}
                      />
                    </div>
                    <div className="w-full">
                      {" "}
                      <InputFiled
                        label="Middle Initial"
                        id="middleInitial"
                        name="middleInitial"
                        value={form.middleInitial}
                        onChange={handleChange}
                        placeholder="Enter middle initial"
                        error={errors.middleInitial}
                      />
                    </div>
                  </div>

                  <InputFiled
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    error={errors.email}
                  />
                  <InputFiled
                    label="Designation"
                    id="designation"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Instructor"
                    error={errors.designation}
                  />
                  <InputFiled
                    label="Department"
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. IT Department"
                    error={errors.department}
                  />
                  <InputFiled
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    error={errors.password}
                  />
                  <InputFiled
                    label="Confirm Password"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    error={errors.confirmPassword}
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
