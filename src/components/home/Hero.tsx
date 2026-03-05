import Image from "next/image";
import Link from "next/link";
import React from "react";
import heroIllustration from "../../../public/note.png";
import { ArrowRight, Check } from "lucide-react";

const checks = [
  "High-Quality Sound",
  "Easy Licensing",
  "4500+ Tracks",
  "Sync Cleared",
];

const stats = [
  { value: "4500+", label: "Original Tracks" },
  { value: "8+",    label: "Genres" },
  { value: "100%",  label: "Sync Cleared" },
];

const Hero = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .lib-hero-root {
          width: 100%;
          background: #fffcf2;
          border-bottom: 1px solid #ccc5b9;
          position: relative;
          overflow: hidden;
        }

        /* Subtle dot grid */
        .lib-hero-root::after {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(64,61,57,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none; z-index: 0;
          mask-image: radial-gradient(ellipse 70% 80% at 60% 50%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 70% 80% at 60% 50%, black 30%, transparent 100%);
        }

        /* Orange left stripe */
        .lib-hero-root::before {
          content: '';
          position: absolute; left: 0; top: 0;
          width: 3px; height: 100%;
          background: linear-gradient(to bottom, transparent, #eb5e28 20%, #eb5e28 80%, transparent);
          pointer-events: none; z-index: 2;
        }

        .lib-hero-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 5rem 3rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 5rem;
          position: relative; z-index: 1;
        }

        /* ── Left ── */
        .lib-hero-left {
          display: flex; flex-direction: column;
          gap: 2.5rem;
        }

        .lib-hero-eyebrow {
          display: flex; align-items: center; gap: 0.75rem;
        }
        .lib-hero-eyebrow-line {
          width: 28px; height: 1px;
          background: #eb5e28; flex-shrink: 0;
        }
        .lib-hero-eyebrow-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #403d39;
          opacity: 0.6;
        }

        .lib-hero-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: clamp(3rem, 6vw, 5.5rem);
          letter-spacing: -0.02em; line-height: 0.95;
          text-transform: uppercase;
          color: #252422;
        }
        .lib-hero-title em { font-style: normal; color: #eb5e28; }

        .lib-hero-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 1rem; font-weight: 400;
          line-height: 1.7; color: #403d39;
          max-width: 460px; opacity: 0.75;
        }

        /* CTA row */
        .lib-hero-ctas {
          display: flex; gap: 0.75rem;
          flex-wrap: wrap;
        }
        .lib-hero-cta-primary {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28;
          border: none; padding: 0.85rem 2rem;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .lib-hero-cta-primary:hover { background: #d44c10; transform: translateY(-1px); }

        .lib-hero-cta-secondary {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #403d39; background: none;
          border: 1px solid #ccc5b9;
          padding: 0.85rem 2rem; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .lib-hero-cta-secondary:hover { border-color: #eb5e28; color: #eb5e28; }

        /* Check pills */
        .lib-hero-checks {
          display: flex; flex-wrap: wrap; gap: 0.6rem;
          padding-top: 0.5rem;
          border-top: 1px solid #ccc5b9;
        }
        .lib-hero-check {
          font-family: 'Manrope', sans-serif;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #403d39;
          display: inline-flex; align-items: center; gap: 0.4rem;
          border: 1px solid #ccc5b9;
          padding: 0.35rem 0.75rem;
          background: #ffffff;
        }
        .lib-hero-check svg { color: #eb5e28; flex-shrink: 0; }

        /* ── Right ── */
        .lib-hero-right {
          display: flex; flex-direction: column;
          gap: 0;
          position: relative;
        }

        /* Image cell */
        .lib-hero-img-cell {
          border: 1px solid #ccc5b9;
          background: #f5f0e8;
          display: flex; align-items: center; justify-content: center;
          padding: 3rem 2rem;
          position: relative; overflow: hidden;
        }
        /* Orange top stripe */
        .lib-hero-img-cell::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28;
        }

        .lib-hero-img-cell img {
          width: 100%; max-width: 320px;
          height: auto; display: block;
          position: relative; z-index: 1;
          filter: drop-shadow(0 8px 32px rgba(37,36,34,0.12));
        }

        /* Stats row under image */
        .lib-hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-left: 1px solid #ccc5b9;
          border-top: none;
        }
        .lib-hero-stat {
          border-right: 1px solid #ccc5b9;
          border-bottom: 1px solid #ccc5b9;
          padding: 1.25rem;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.25rem; text-align: center;
          transition: background 0.2s ease;
          background: #fffcf2;
        }
        .lib-hero-stat:hover { background: #f5f0e8; }
        .lib-hero-stat-value {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: clamp(1.25rem, 2.5vw, 1.75rem);
          letter-spacing: -0.02em; line-height: 1;
          color: #eb5e28;
        }
        .lib-hero-stat-label {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #403d39; opacity: 0.5;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .lib-hero-inner { grid-template-columns: 1fr; gap: 3rem; }
          .lib-hero-right { max-width: 480px; }
        }
        @media (max-width: 640px) {
          .lib-hero-inner { padding: 3rem 1.5rem; }
          .lib-hero-title { font-size: 2.75rem; }
          .lib-hero-stats { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <section className="lib-hero-root">
        <div className="lib-hero-inner">

          {/* Left */}
          <div className="lib-hero-left">
            <div className="lib-hero-eyebrow">
              <span className="lib-hero-eyebrow-line" />
              <span className="lib-hero-eyebrow-text">CMMG Production Music Library</span>
            </div>

            <h1 className="lib-hero-title">
              High-Quality<br />
              Sound &<br />
              <em>Music Library</em>
            </h1>

            <p className="lib-hero-desc">
              The ultimate resource for sound designers, video producers,
              podcasters, and musicians who need professional, sync-cleared
              audio for their projects.
            </p>

            <div className="lib-hero-ctas">
              <Link href="/library" className="lib-hero-cta-primary">
                Browse Library
                <ArrowRight size={14} />
              </Link>
              <Link href="/signup" className="lib-hero-cta-secondary">
                Create Account
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="lib-hero-checks">
              {checks.map((c, i) => (
                <span key={i} className="lib-hero-check">
                  <Check size={11} />
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="lib-hero-right">
            <div className="lib-hero-img-cell">
              <Image
                src={heroIllustration}
                alt="Music Library Illustration"
                style={{ width: "100%", maxWidth: 320, height: "auto" }}
              />
            </div>
            <div className="lib-hero-stats">
              {stats.map((s, i) => (
                <div key={i} className="lib-hero-stat">
                  <div className="lib-hero-stat-value">{s.value}</div>
                  <div className="lib-hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Hero;