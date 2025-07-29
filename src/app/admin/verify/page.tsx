"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminVerify() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isResending, setIsResending] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/admin/signup");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.success });
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/signin");
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, action: "resend" }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.success });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to resend code. Please try again.",
      });
    }

    setIsResending(false);
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Verify Your Account
        </h2>

        <p className="text-gray-600 text-center mb-6">
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              placeholder="000000"
            />
          </div>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-4"
          >
            {isLoading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-blue-600 hover:underline text-sm disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend verification code"}
          </button>
        </div>

        <p className="text-center mt-4 text-sm text-gray-600">
          <Link href="/admin/signup" className="text-blue-600 hover:underline">
            Back to signup
          </Link>
        </p>
      </div>
    </div>
  );
}
