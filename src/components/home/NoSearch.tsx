import React from "react";
import Link from "next/link";
import Image from "next/image";
import composer from "../../../public/Composer-rafiki.png";
import { ArrowRight } from "lucide-react";

interface NoSearchProps {
  className?: string;
}

const NoSearch: React.FC<NoSearchProps> = ({ className = "" }) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .ns-root {
          width: 100%;
          background: #fffcf2;
          border-top: 1px solid #ccc5b9;
          position: relative;
        }

        .ns-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 5rem 3rem;
        }

        /* ── Two-col bordered card ── */
        .ns-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-left: 1px solid #ccc5b9;
          border-top: 1px solid #ccc5b9;
          position: relative;
          overflow: hidden;
        }

        /* Orange top stripe */
        .ns-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28; z-index: 2;
        }

        /* ── Left: content ── */
        .ns-left {
          border-right: 1px solid #ccc5b9;
          border-bottom: 1px solid #ccc5b9;
          padding: 4rem 3rem;
          display: flex; flex-direction: column;
          justify-content: center; gap: 2rem;
        }

        .ns-eyebrow {
          display: flex; align-items: center; gap: 0.75rem;
        }
        .ns-eyebrow-line { width: 28px; height: 1px; background: #eb5e28; flex-shrink: 0; }
        .ns-eyebrow-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #403d39; opacity: 0.55;
        }

        .ns-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4vw, 3.75rem);
          letter-spacing: -0.02em; line-height: 0.95;
          text-transform: uppercase; color: #252422;
        }
        .ns-title em { font-style: normal; color: #eb5e28; }

        .ns-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 0.92rem; font-weight: 400;
          line-height: 1.75; color: #403d39;
          opacity: 0.65; max-width: 460px;
        }

        /* CTAs */
        .ns-ctas { display: flex; gap: 0.75rem; flex-wrap: wrap; }

        .ns-cta-primary {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28; border: none;
          padding: 0.85rem 1.75rem; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .ns-cta-primary:hover { background: #d44c10; transform: translateY(-1px); }

        .ns-cta-secondary {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #403d39; background: none;
          border: 1px solid #ccc5b9;
          padding: 0.85rem 1.75rem; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .ns-cta-secondary:hover { border-color: #eb5e28; color: #eb5e28; }

        /* ── Right: illustration ── */
        .ns-right {
          border-right: 1px solid #ccc5b9;
          border-bottom: 1px solid #ccc5b9;
          background: #f5f0e8;
          display: flex; align-items: center; justify-content: center;
          padding: 3rem;
          position: relative; overflow: hidden;
        }

        /* Dot grid on right panel */
        .ns-right::after {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(64,61,57,0.07) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .ns-illustration {
          position: relative; z-index: 1;
          width: 100%; max-width: 360px;
          filter: drop-shadow(0 8px 24px rgba(37,36,34,0.1));
          transition: transform 0.5s ease;
        }
        .ns-right:hover .ns-illustration { transform: translateY(-6px); }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .ns-card  { grid-template-columns: 1fr; }
          .ns-right { min-height: 360px; }
          .ns-left  { padding: 3rem 2rem; }
        }
        @media (max-width: 640px) {
          .ns-inner { padding: 3rem 1.5rem; }
          .ns-left  { padding: 2.5rem 1.5rem; }
          .ns-right { padding: 2rem 1.5rem; min-height: 280px; }
        }
      `}</style>

      <section className={`ns-root ${className}`}>
        <div className="ns-inner">
          <div className="ns-card">

            {/* Left — content */}
            <div className="ns-left">
              <div className="ns-eyebrow">
                <span className="ns-eyebrow-line" />
                <span className="ns-eyebrow-text">Production Music Excellence</span>
              </div>

              <h2 className="ns-title">
                Your Trusted Source for{" "}
                <em>African</em> &<br />
                International Music
              </h2>

              <p className="ns-desc">
                CMMG connects filmmakers, broadcasters, and media creators with
                high-quality production music. Our collaborations with African
                and global composers ensure an authentic, diverse catalog tailored
                for TV, radio, film, and multimedia projects.
              </p>

              <div className="ns-ctas">
                <Link href="/about-us" className="ns-cta-primary">
                  About Us
                  <ArrowRight size={13} />
                </Link>
                <Link href="/catalog" className="ns-cta-secondary">
                  Browse Catalog
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Right — illustration */}
            <div className="ns-right">
              <Image
                src={composer}
                alt="Composer illustration"
                className="ns-illustration"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default NoSearch;