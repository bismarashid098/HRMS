import React from "react";

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.18)] border border-slate-100 min-w-[150px]">
      <div className="text-[11px] font-extrabold text-slate-400 mb-2">
        {label}
      </div>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: p.color || p.stroke || p.fill }}
            />
            <div className="text-[12px] font-medium text-slate-500">
              {p.name}:
            </div>
            <div className="text-[12px] font-black text-slate-800">
              {p.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

