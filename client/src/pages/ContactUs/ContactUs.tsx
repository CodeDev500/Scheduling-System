import React, { useState } from "react";
import {
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
} from "react-icons/io5";
import Button from "../../components/buttons/Button";
import InputField from "../../components/input_field/InputField";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">
            Get in touch with us for any inquiries or concerns
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg p-8 text-gray-800">
            <h2 className="text-2xl font-semibold mb-6 text-rose-800">
              Contact Information
            </h2>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-full">
                  <IoLocationOutline className="text-2xl text-rose-600" />
                </div>
                <div>
                  <h3 className="font-medium text-rose-800">Location</h3>
                  <p>WMSU Pagadian Campus, Pagadian City</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-full">
                  <IoMailOutline className="text-2xl text-rose-600" />
                </div>
                <div>
                  <h3 className="font-medium text-rose-800">Email</h3>
                  <p>info@wmsupagadian.edu.ph</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-full">
                  <IoCallOutline className="text-2xl text-rose-600" />
                </div>
                <div>
                  <h3 className="font-medium text-rose-800">Phone</h3>
                  <p>+63 XXX XXX XXXX</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Name"
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <InputField
                label="Email"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <InputField
                label="Subject"
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                required
              />

              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block mb-1 font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full text-gray-700 rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.message
                      ? "border-blue-500 focus:ring-blue-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  required
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  label="Send Message"
                  variant="primary"
                  className="w-full bg-rose-600 hover:bg-rose-700"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
