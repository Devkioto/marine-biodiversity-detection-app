import React from "react";

export default function OscillationLoader({ message = "Processing..." }) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-36">
        <svg viewBox="0 0 120 120" className="w-full h-auto" aria-hidden>
          <g className="osc-group" transform="translate(60,60)">
            <circle className="arc arc1" r="38" fill="none" />
            <circle className="arc arc2" r="28" fill="none" />
            <circle className="arc arc3" r="18" fill="none" />
            <g className="dots" transform="translate(0,0)">
              <circle className="osc-dot d1" cx="-42" cy="0" r="3.5" />
              <circle className="osc-dot d2" cx="-52" cy="0" r="3" />
              <circle className="osc-dot d3" cx="-62" cy="0" r="2.5" />
            </g>
          </g>
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900">{message}</p>
        <p className="text-sm text-slate-500">Analyzing media — please wait while we process frames</p>
      </div>
    </div>
  );
}
