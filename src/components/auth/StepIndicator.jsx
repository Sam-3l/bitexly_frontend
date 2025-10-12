import React from "react";
import clsx from "clsx";

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-4 w-full overflow-x-auto py-2">
      {steps.map((s, i) => {
        const idx = i + 1;
        const active = idx === current;
        const done = idx < current;
        return (
          <div key={s.label} className="flex items-center gap-3 min-w-[120px]">
            <div
              className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold shrink-0",
                done
                  ? "bg-indigo-600 text-white shadow"
                  : active
                  ? "bg-white border border-indigo-500 text-indigo-600 shadow-sm"
                  : "bg-white/80 text-gray-600 border border-gray-200"
              )}
            >
              {done ? "✓" : idx}
            </div>
            <div className="flex flex-col">
              <span
                className={clsx(
                  "text-sm font-medium",
                  active ? "text-indigo-700" : "text-gray-600"
                )}
              >
                {s.label}
              </span>
              <span className="text-xs text-gray-400">{s.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}