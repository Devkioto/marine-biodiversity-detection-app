import React from "react";

export default function FishAnimation({ message = "Processing..." }) {
  return (
    <div className="flex items-center gap-4">
      <div className="fish-wrapper w-64 overflow-visible">
        <svg viewBox="0 0 220 80" className="fish-svg" aria-hidden="true">
          <g className="fish-group">
            <g className="fish-body" transform="translate(60,40)">
              <ellipse rx="28" ry="18" fill="#0ea5e9" />
              <circle cx="6" cy="-4" r="3.5" fill="#083344" />
            </g>
            <g className="fish-tail" transform="translate(32,40)">
              <path d="M0 0 L-16 -12 L-8 0 L-16 12 Z" fill="#0369a1" />
            </g>
            <g className="fish-fin" transform="translate(48,36)">
              <path d="M0 0 L10 -8 L6 0 Z" fill="#0284c7" />
            </g>
          </g>
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{message}</p>
        <p className="text-xs text-slate-500">Detecting marine life — the AI is analyzing frames</p>
      </div>
    </div>
  );
}
