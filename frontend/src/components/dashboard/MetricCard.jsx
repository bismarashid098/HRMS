import React from "react";

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
  spark,
}) {
  return (
    <div
      className={[
        "relative h-full overflow-hidden rounded-2xl px-5 pt-4 pb-3 text-white",
        "shadow-[0_12px_34px_rgba(0,0,0,0.18)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(0,0,0,0.24)]",
      ].join(" ")}
      style={{ backgroundImage: gradient }}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute top-1/2 right-14 h-14 w-14 -translate-y-1/2 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-white/70">
            {label}
          </div>
          <div className="mt-1 text-2xl font-black tracking-[-0.02em] leading-tight">
            {value}
          </div>
          {sub && (
            <div className="mt-1 text-[10px] font-medium text-white/60">
              {sub}
            </div>
          )}
        </div>

        {Icon && (
          <div className="shrink-0 rounded-2xl bg-white/20 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            <Icon className="h-[17px] w-[17px]" />
          </div>
        )}
      </div>

      {spark && <div className="relative mt-2.5">{spark}</div>}
    </div>
  );
}

