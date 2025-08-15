"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircleIcon } from "lucide-react";

export default function VerifyForm({ email }: { email: string }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Missing email. Please sign up again.");
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch("/api/auth/user/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, code }),
                });

                if (res.ok) {
                    router.push("/signin?verified=true");
                } else {
                    const data = await res.json();
                    setError(data.message || "Verification failed.");
                }
            } catch {
                setError("Verification failed. Please try again.");
            }
        });
    };

    return (
        <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-4">
            <h1 className="text-2xl font-bold text-center">Verify Your Email</h1>
            <p className="text-center text-muted-foreground text-sm">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium">{email}</span>
            </p>

            {error && (
                <Alert variant="destructive">
                    <XCircleIcon className="h-5 w-5" />
                    <AlertTitle>Verification Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
                <input
                    type="text"
                    name="code"
                    placeholder="6-digit verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:border-black"
                />

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                >
                    {isPending ? "Verifying..." : "Verify"}
                </button>
            </form>
        </div>
    );
}
