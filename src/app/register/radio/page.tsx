// app/register/radio/page.tsx
"use client";

import { useState } from "react";
import { Radio, Mail, Building2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function RadioRegistrationPage() {
  const [formData, setFormData] = useState({
    stationName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register/radio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ stationName: "", email: "" });
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Registration Successful! 🎉
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            We've sent your permanent sign-in link to your email address. 
            Please check your inbox (and spam folder just in case).
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
            <p className="text-sm text-blue-800 font-semibold mb-2">📧 What's Next?</p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
              <li>Check your email for the sign-in link</li>
              <li>Bookmark the link for easy access</li>
              <li>Click it anytime to access your account</li>
            </ul>
          </div>
          
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-500 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Register Another Station
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 rounded-2xl mb-4 shadow-lg">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Radio Station Registration
          </h1>
          <p className="text-gray-600">
            Get instant access to the CMMG Music platform
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Station Name Input */}
            <div>
              <label htmlFor="stationName" className="block text-sm font-semibold text-gray-700 mb-2">
                Station Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="stationName"
                  name="stationName"
                  value={formData.stationName}
                  onChange={handleChange}
                  required
                  placeholder="Station Name"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            {/* Category Select */}
            <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Station Category
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                    id="category"
                    name="category"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    >
                    <option value="">
                        Select category
                    </option>
                    <option value="sabc">SABC</option>
                    <option value="community">Community</option>
                    <option value="independent">Independent</option>
                    <option value="podcast">Podcast</option>
                    </select>
                </div>
            </div>


            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="station@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <p className="mt-5 text-xs text-gray-500">
                Your sign-in link will be sent to this email
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-400 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Radio className="mr-2 h-5 w-5" />
                  Register Station
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              What You'll Get
            </h3>
            <ul className="text-xs text-orange-700 space-y-1 ml-6 list-disc">
               <li>Instant account creation</li>
                <li>Access to over 4,000 high-quality songs</li>
                <li>Simple and hassle-free licensing</li>
                <li>Download tracks anytime for your projects</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact our support team
        </p>
      </div>
    </div>
  );
}