import React, { useState } from "react";
import {
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
  IoTimeOutline,
  IoSendSharp,
} from "react-icons/io5";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in">
            Get In Touch
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Have questions about OptiSched? We're here to help you optimize your scheduling experience
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Cards */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <IoLocationOutline className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Visit Us</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              WMSU Pagadian Campus<br />
              Pagadian City<br />
              Zamboanga del Sur, Philippines
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-purple-500">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <IoMailOutline className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Email Us</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              info@wmsupagadian.edu.ph<br />
              optisched@wmsu.edu.ph<br />
              support@optisched.com
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-pink-500">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <IoCallOutline className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Call Us</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              +63 (062) 214-5807<br />
              +63 917 123 4567<br />
              Mon-Fri: 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-8 md:p-10 shadow-xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Send Us a Message</h2>
              <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible</p>
            </div>

            {submitSuccess && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Message sent successfully! We'll get back to you soon.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  placeholder="John Doe"
                />

                <InputField
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <InputField
                label="Subject"
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                required
                placeholder="How can we help you?"
              />

              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block mb-2 font-semibold text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full text-gray-700 rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                    errors.message
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Tell us more about your inquiry..."
                  required
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isSubmitting && <IoSendSharp className="text-xl" />}
                <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
              </button>
            </form>
          </div>

          {/* Additional Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Office Hours */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center mb-6">
                <IoTimeOutline className="text-4xl mr-4" />
                <h3 className="text-2xl font-bold">Office Hours</h3>
              </div>
              <div className="space-y-3 text-blue-50">
                <div className="flex justify-between border-b border-blue-400 pb-2">
                  <span className="font-semibold">Monday - Friday</span>
                  <span>8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-blue-400 pb-2">
                  <span className="font-semibold">Saturday</span>
                  <span>9:00 AM - 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Connect With Us</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                >
                  <FaFacebookF className="text-xl" />
                </a>
                <a
                  href="#"
                  className="bg-sky-500 hover:bg-sky-600 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                >
                  <FaTwitter className="text-xl" />
                </a>
                <a
                  href="#"
                  className="bg-blue-700 hover:bg-blue-800 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                >
                  <FaLinkedinIn className="text-xl" />
                </a>
              </div>
              <p className="text-gray-600 mt-6 text-sm">
                Follow us on social media for updates, tips, and news about OptiSched!
              </p>
            </div>

            {/* Quick Response */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-3">Quick Response</h3>
              <p className="text-green-800 text-sm leading-relaxed">
                We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.
              </p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-2xl p-4 shadow-xl">
          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.123456789!2d123.4567890!3d7.8234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDknMjQuNCJOIDEyM8KwMjcnMjQuNCJF!5e0!3m2!1sen!2sph!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="WMSU Pagadian Campus Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
