"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import GoogleSignIn from "../_components/google-sign-in";

type ErrorType = string | { field: string; message: string }[] | null;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<ErrorType>();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fieldError = (field: string) =>
    Array.isArray(error)
      ? error.filter((e) => e.field === field).map((e) => e.message)
      : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
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
          router.push(`/verify?email=${encodeURIComponent(data.email as string)}`);
        } else {
          const errorData = await res.json();
          setError(errorData.errors || errorData.message || "Something went wrong");
        }
      } catch {
        setError("Error while trying to sign up.");
      }
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .su-page {
          min-height: 100vh;
          background: #fffcf2;
          display: flex; align-items: center; justify-content: center;
          padding: 3rem 1.5rem;
          position: relative;
        }

        /* Dot grid bg */
        .su-page::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(64,61,57,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .su-card {
          width: 100%; max-width: 480px;
          border: 1px solid #ccc5b9;
          background: #fffcf2;
          position: relative; z-index: 1;
        }

        /* Orange top stripe */
        .su-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28;
        }

        /* ── Card header ── */
        .su-card-head {
          padding: 2.5rem 2.5rem 0;
          border-bottom: 1px solid #ccc5b9;
          padding-bottom: 2rem;
        }
        .su-eyebrow {
          display: flex; align-items: center; gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .su-eyebrow-line { width: 20px; height: 1px; background: #eb5e28; }
        .su-eyebrow-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #403d39; opacity: 0.5;
        }
        .su-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: 2rem; letter-spacing: -0.02em; line-height: 1;
          text-transform: uppercase; color: #252422;
        }
        .su-title em { font-style: normal; color: #eb5e28; }
        .su-subtitle {
          font-family: 'Manrope', sans-serif;
          font-size: 0.8rem; font-weight: 400;
          color: #403d39; opacity: 0.55;
          margin-top: 0.5rem; line-height: 1.5;
        }

        /* ── Form body ── */
        .su-body { padding: 2rem 2.5rem; display: flex; flex-direction: column; gap: 0; }

        /* Error banner */
        .su-error {
          border: 1px solid #eb5e28;
          border-left: 3px solid #eb5e28;
          background: rgba(235,94,40,0.04);
          padding: 0.9rem 1rem;
          display: flex; gap: 0.6rem; align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .su-error svg { color: #eb5e28; flex-shrink: 0; margin-top: 1px; }
        .su-error-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem; font-weight: 500;
          color: #252422; line-height: 1.5;
        }

        /* Field group */
        .su-field {
          display: flex; flex-direction: column;
          border-bottom: 1px solid #ccc5b9;
          position: relative;
        }
        .su-field:first-of-type { border-top: 1px solid #ccc5b9; }

        .su-field-label {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #403d39; opacity: 0.5;
          padding: 0.75rem 1rem 0;
        }
        .su-field-input-wrap { position: relative; }
        .su-field-input {
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem; font-weight: 500;
          color: #252422; background: transparent; border: none;
          width: 100%; padding: 0.5rem 1rem 0.85rem;
          outline: none;
        }
        .su-field-input::placeholder { color: #ccc5b9; }

        /* Focus state: orange left bar */
        .su-field:focus-within {
          background: rgba(235,94,40,0.02);
        }
        .su-field::after {
          content: '';
          position: absolute; left: 0; top: 0;
          width: 3px; height: 100%;
          background: #eb5e28;
          transform: scaleY(0); transform-origin: top;
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .su-field:focus-within::after { transform: scaleY(1); }

        /* Eye toggle */
        .su-eye {
          position: absolute; right: 1rem; bottom: 0.75rem;
          background: none; border: none; cursor: pointer;
          color: #ccc5b9; padding: 0;
          transition: color 0.2s ease;
        }
        .su-eye:hover { color: #403d39; }

        /* Inline field error */
        .su-field-error {
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem; font-weight: 500;
          color: #eb5e28;
          padding: 0.3rem 1rem 0.5rem;
          border-top: 1px solid rgba(235,94,40,0.15);
        }

        /* Submit */
        .su-submit {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28; border: none;
          width: 100%; padding: 1rem;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          cursor: pointer; margin-top: 1.75rem;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .su-submit:hover:not(:disabled) { background: #d44c10; transform: translateY(-1px); }
        .su-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Divider */
        .su-divider {
          display: flex; align-items: center; gap: 1rem;
          margin: 1.25rem 0;
        }
        .su-divider-line { flex: 1; height: 1px; background: #ccc5b9; }
        .su-divider-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #403d39; opacity: 0.35; white-space: nowrap;
        }

        /* Footer */
        .su-footer {
          padding: 1.25rem 2.5rem;
          border-top: 1px solid #ccc5b9;
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem; font-weight: 500;
          color: #403d39; opacity: 0.6;
          text-align: center;
        }
        .su-footer a {
          color: #eb5e28; text-decoration: none; font-weight: 600; opacity: 1;
        }
        .su-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="su-page">
        <div className="su-card">

          {/* Header */}
          <div className="su-card-head">
            <div className="su-eyebrow">
              <span className="su-eyebrow-line" />
              <span className="su-eyebrow-text">CMMG Music Library</span>
            </div>
            <div className="su-title">Create <em>Account</em></div>
            <p className="su-subtitle">Access 4500+ sync-cleared tracks for your productions.</p>
          </div>

          {/* Form */}
          <div className="su-body">

            {/* Error banner */}
            {error && (
              <div className="su-error">
                <XCircle size={15} />
                <div className="su-error-text">
                  {Array.isArray(error)
                    ? error.map((e, i) => <div key={i}>{e.message}</div>)
                    : error.toString()
                  }
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="su-field">
                <label className="su-field-label" htmlFor="name">Full Name</label>
                <div className="su-field-input-wrap">
                  <input id="name" name="name" type="text" placeholder="Your name" required className="su-field-input" />
                </div>
                {fieldError("name").map((msg, i) => <div key={i} className="su-field-error">{msg}</div>)}
              </div>

              {/* Email */}
              <div className="su-field">
                <label className="su-field-label" htmlFor="email">Email Address</label>
                <div className="su-field-input-wrap">
                  <input id="email" name="email" type="email" placeholder="you@example.com" required className="su-field-input" />
                </div>
                {fieldError("email").map((msg, i) => <div key={i} className="su-field-error">{msg}</div>)}
              </div>

              {/* Password */}
              <div className="su-field">
                <label className="su-field-label" htmlFor="password">Password</label>
                <div className="su-field-input-wrap">
                  <input
                    id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters" required
                    className="su-field-input" style={{ paddingRight: "2.5rem" }}
                  />
                  <button type="button" className="su-eye" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {fieldError("password").map((msg, i) => <div key={i} className="su-field-error">{msg}</div>)}
              </div>

              {/* Confirm password */}
              <div className="su-field">
                <label className="su-field-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="su-field-input-wrap">
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password" required
                    className="su-field-input" style={{ paddingRight: "2.5rem" }}
                  />
                  <button type="button" className="su-eye" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {fieldError("confirmPassword").map((msg, i) => <div key={i} className="su-field-error">{msg}</div>)}
              </div>

              <button type="submit" disabled={isPending} className="su-submit">
                {isPending ? "Creating Account…" : (
                  <>Create Account <ArrowRight size={13} /></>
                )}
              </button>
            </form>

            <div className="su-divider">
              <span className="su-divider-line" />
              <span className="su-divider-text">or continue with</span>
              <span className="su-divider-line" />
            </div>

            <GoogleSignIn />

          </div>

          {/* Footer */}
          <div className="su-footer">
            Already have an account?{" "}
            <Link href="/signin">Sign in</Link>
          </div>

        </div>
      </div>
    </>
  );
}