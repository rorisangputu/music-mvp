"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, XCircle, CheckCircle } from "lucide-react";
import GoogleSignIn from "../_components/google-sign-in";

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/user/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.success });
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      } else {
        if (data.redirectTo) {
          setTimeout(() => router.push(data.redirectTo), 2000);
        }
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    }

    setIsLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .si-page {
          min-height: 100vh;
          background: #fffcf2;
          display: flex; align-items: center; justify-content: center;
          padding: 3rem 1.5rem;
          position: relative;
        }
        .si-page::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(64,61,57,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .si-card {
          width: 100%; max-width: 440px;
          border: 1px solid #ccc5b9;
          background: #fffcf2;
          position: relative; z-index: 1;
        }
        .si-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28;
        }

        /* ── Header ── */
        .si-head {
          padding: 2.5rem 2.5rem 2rem;
          border-bottom: 1px solid #ccc5b9;
        }
        .si-eyebrow {
          display: flex; align-items: center; gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .si-eyebrow-line { width: 20px; height: 1px; background: #eb5e28; }
        .si-eyebrow-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #403d39; opacity: 0.5;
        }
        .si-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800; font-size: 2rem;
          letter-spacing: -0.02em; line-height: 1;
          text-transform: uppercase; color: #252422;
        }
        .si-title em { font-style: normal; color: #eb5e28; }
        .si-subtitle {
          font-family: 'Manrope', sans-serif;
          font-size: 0.8rem; font-weight: 400;
          color: #403d39; opacity: 0.55;
          margin-top: 0.5rem; line-height: 1.5;
        }

        /* ── Body ── */
        .si-body { padding: 2rem 2.5rem; }

        /* Message banners */
        .si-msg {
          border-left: 3px solid;
          padding: 0.85rem 1rem;
          display: flex; gap: 0.6rem; align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .si-msg.error { border-color: #eb5e28; background: rgba(235,94,40,0.04); }
        .si-msg.success { border-color: #403d39; background: rgba(64,61,57,0.04); }
        .si-msg svg { flex-shrink: 0; margin-top: 1px; }
        .si-msg.error svg { color: #eb5e28; }
        .si-msg.success svg { color: #403d39; }
        .si-msg-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem; font-weight: 500;
          color: #252422; line-height: 1.5;
        }

        /* Google first */
        .si-google-wrap { margin-bottom: 1.25rem; }

        /* Divider */
        .si-divider {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .si-divider-line { flex: 1; height: 1px; background: #ccc5b9; }
        .si-divider-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #403d39; opacity: 0.35; white-space: nowrap;
        }

        /* Fields */
        .si-field {
          display: flex; flex-direction: column;
          border-bottom: 1px solid #ccc5b9;
          position: relative;
        }
        .si-field:first-of-type { border-top: 1px solid #ccc5b9; }
        .si-field-label {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #403d39; opacity: 0.5;
          padding: 0.75rem 1rem 0;
        }
        .si-field-input {
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem; font-weight: 500;
          color: #252422; background: transparent; border: none;
          width: 100%; padding: 0.5rem 1rem 0.85rem;
          outline: none;
        }
        .si-field-input::placeholder { color: #ccc5b9; }
        .si-field:focus-within { background: rgba(235,94,40,0.02); }
        .si-field::after {
          content: '';
          position: absolute; left: 0; top: 0;
          width: 3px; height: 100%;
          background: #eb5e28;
          transform: scaleY(0); transform-origin: top;
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .si-field:focus-within::after { transform: scaleY(1); }
        .si-eye {
          position: absolute; right: 1rem; bottom: 0.75rem;
          background: none; border: none; cursor: pointer;
          color: #ccc5b9; padding: 0;
          transition: color 0.2s ease;
        }
        .si-eye:hover { color: #403d39; }

        /* Forgot password */
        .si-forgot {
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.08em;
          color: #403d39; opacity: 0.45; text-decoration: none;
          display: block; text-align: right;
          margin-top: 0.75rem;
          transition: opacity 0.2s ease, color 0.2s ease;
        }
        .si-forgot:hover { color: #eb5e28; opacity: 1; }

        /* Submit */
        .si-submit {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28; border: none;
          width: 100%; padding: 1rem;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          cursor: pointer; margin-top: 1.75rem;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .si-submit:hover:not(:disabled) { background: #d44c10; transform: translateY(-1px); }
        .si-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Footer */
        .si-footer {
          padding: 1.25rem 2.5rem;
          border-top: 1px solid #ccc5b9;
          display: flex; flex-direction: column; gap: 0.5rem;
          align-items: center; text-align: center;
        }
        .si-footer-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.72rem; font-weight: 500;
          color: #403d39; opacity: 0.6;
        }
        .si-footer-text a {
          color: #eb5e28; text-decoration: none; font-weight: 600; opacity: 1;
        }
        .si-footer-text a:hover { text-decoration: underline; }
        .si-footer-divider { width: 1px; height: 12px; background: #ccc5b9; }
      `}</style>

      <div className="si-page">
        <div className="si-card">

          {/* Header */}
          <div className="si-head">
            <div className="si-eyebrow">
              <span className="si-eyebrow-line" />
              <span className="si-eyebrow-text">CMMG Music Library</span>
            </div>
            <div className="si-title">Welcome <em>Back</em></div>
            <p className="si-subtitle">Sign in to access your licensed tracks and downloads.</p>
          </div>

          {/* Body */}
          <div className="si-body">

            {/* Status message */}
            {message.text && (
              <div className={`si-msg ${message.type}`}>
                {message.type === "error"
                  ? <XCircle size={15} />
                  : <CheckCircle size={15} />
                }
                <div className="si-msg-text">{message.text}</div>
              </div>
            )}

            {/* Google */}
            <div className="si-google-wrap">
              <GoogleSignIn />
            </div>

            <div className="si-divider">
              <span className="si-divider-line" />
              <span className="si-divider-text">or continue with email</span>
              <span className="si-divider-line" />
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="si-field">
                <label className="si-field-label" htmlFor="email">Email Address</label>
                <input
                  id="email" type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="si-field-input"
                />
              </div>

              {/* Password */}
              <div className="si-field">
                <label className="si-field-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Your password"
                  className="si-field-input"
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  className="si-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <Link href="/forgot-password" className="si-forgot">
                Forgot password?
              </Link>

              <button type="submit" disabled={isLoading} className="si-submit">
                {isLoading ? "Signing In…" : (
                  <>Sign In <ArrowRight size={13} /></>
                )}
              </button>
            </form>

          </div>

          {/* Footer */}
          <div className="si-footer">
            <p className="si-footer-text">
              Don't have an account? <Link href="/signup">Create one</Link>
            </p>
            <p className="si-footer-text">
              <Link href="/admin/verify">Need to verify your account?</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}