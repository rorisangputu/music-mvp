"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircleIcon } from "lucide-react";
import GoogleSignIn from "../_components/google-sign-in";

type ErrorType = string | { field: string; message: string }[] | null;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<ErrorType>();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      // phone: formData.get("phone"),
      // address: formData.get("address"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/user/signup", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          router.push(
            `/verify?email=${encodeURIComponent(data.email as string)}`
          );
        } else {
          const errorData = await res.json();
          if (errorData.errors) {
            setError(errorData.errors);
          } else {
            setError(errorData.message || "Something went wrong");
          }

        }
      } catch {
        setError("Error while trying to sign in.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto my-20 p-6 bg-white rounded-2xl shadow space-y-6">
      <h1 className="text-2xl font-bold text-center">Create Your Account</h1>

      {error && (
        <Alert variant="destructive">
          <XCircleIcon className="h-5 w-5" />
          <AlertTitle>Sign Up Failed</AlertTitle>
          <AlertDescription>
            {Array.isArray(error) ?
              error.map((e, idx) => (
                <div key={idx} className="text-red-500 text-sm">
                  {e.message}
                </div>
              )) : <p>{error.toString()}</p>
            }
            
          </AlertDescription>
        </Alert>
      )}

      <GoogleSignIn />


      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          required
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
        />
        {Array.isArray(error) &&
          error
            .filter((e) => e.field === "name")
            .map((e, idx) => (
              <div key={idx} className="text-red-500 text-sm">
                {e.message}
              </div>
            ))
          }
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
        />
        {Array.isArray(error) &&
          error
            .filter((e) => e.field === "email")
            .map((e, idx) => (
              <div key={idx} className="text-red-500 text-sm">
                {e.message}
              </div>
            ))
          }
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
        />
        {Array.isArray(error) &&
          error
            .filter((e) => e.field === "password")
            .map((e, idx) => (
              <div key={idx} className="text-red-500 text-sm">
                {e.message}
              </div>
            ))
          }

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          required
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
        />
        {Array.isArray(error) &&
          error
            .filter((e) => e.field === "confirmPassword")
            .map((e, idx) => (
              <div key={idx} className="text-red-500 text-sm">
                <ul><li>{e.message}</li></ul>
              </div>
            ))
          }

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black transition text-white py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
