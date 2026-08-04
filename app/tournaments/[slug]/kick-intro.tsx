"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen "kick-off" intro: a boot strikes a neon ball that rockets across,
 * then a flash reveals the page. Plays once per session per cup, and is skipped
 * for users who prefer reduced motion.
 */
export default function KickIntro({ slug }: { slug: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // ?kick=1 forces a replay (handy for demos/screenshots).
    const forced = new URLSearchParams(window.location.search).has("kick");
    const key = `gw_kick_${slug}`;
    if (!forced && sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    setShow(true);
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, [slug]);

  if (!show) return null;

  return (
    <div className="kick-intro" aria-hidden onClick={() => setShow(false)}>
      <div className="kick-stage">
        <div className="kick-pitch" />

        {/* Kicking leg + boot */}
        <svg className="kick-leg" viewBox="0 0 120 200">
          <defs>
            <linearGradient id="legGrad" x1="0" y1="0" x2="120" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00c2ff" />
              <stop offset="100%" stopColor="#e6007e" />
            </linearGradient>
          </defs>
          {/* shin */}
          <rect x="46" y="10" width="20" height="120" rx="10" fill="url(#legGrad)" />
          {/* foot / boot */}
          <path
            d="M46 120 h20 v34 q0 10 10 10 h34 q10 0 10 8 v6 q0 6 -6 6 H52 q-6 0 -6 -6 Z"
            fill="url(#legGrad)"
          />
          {/* studs */}
          <g fill="#0a0a14">
            <rect x="60" y="188" width="6" height="6" rx="2" />
            <rect x="78" y="188" width="6" height="6" rx="2" />
            <rect x="96" y="188" width="6" height="6" rx="2" />
          </g>
        </svg>

        {/* Ball */}
        <div className="kick-ball">
          <span className="kick-ball-trail" />
          <svg viewBox="0 0 48 48" className="kick-ball-svg">
            <defs>
              <radialGradient id="ballGrad" cx="38%" cy="34%" r="72%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#c9d4ff" />
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="21" fill="url(#ballGrad)" stroke="#00c2ff" strokeWidth="2" />
            <polygon points="24,13 32,19 29,29 19,29 16,19" fill="#0a0a14" />
            <g stroke="#0a0a14" strokeWidth="1.6" fill="none">
              <path d="M24 13 V5" />
              <path d="M32 19 L40 16" />
              <path d="M29 29 L34 37" />
              <path d="M19 29 L14 37" />
              <path d="M16 19 L8 16" />
            </g>
          </svg>
        </div>

        <p className="kick-word">KICK&nbsp;OFF</p>
      </div>

      <div className="kick-flash" />
    </div>
  );
}
