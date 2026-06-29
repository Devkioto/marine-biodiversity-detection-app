import React from "react";

export default function SpinnerLoader({ message = "Processing..." }) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative flex items-center justify-center">
        <svg className="h-20 w-20" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <circle className="spinner-bg" cx="50" cy="50" r="40" strokeWidth="10" fill="none" stroke="#e6f7fb" />
          <circle className="spinner-fg" cx="50" cy="50" r="40" strokeWidth="10" fill="none" stroke="url(#g1)" strokeLinecap="round" strokeDasharray="188" strokeDashoffset="188" />
          <circle className="spinner-dot" cx="50" cy="10" r="6" fill="#0ea5e9" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900">{message}</p>
        <p className="text-sm text-slate-500">Analyzing media — this may take a few moments</p>
      </div>
    </div>
  );
}
