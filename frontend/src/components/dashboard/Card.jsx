import React from "react";

export function Card({
  title,
  subtitle,
  right,
  children,
  className = "",
  accent,
}) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-2xl bg-white",
        "border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.08)]",
        "transition-shadow duration-200 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08),0_18px_50px_rgba(0,0,0,0.10)]",
        className,
      ].join(" ")}
    >
      {accent && (
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${accent} 0%, ${accent}66 100%)`,
          }}
        />
      )}

      {(title || subtitle || right) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-50">
          <div className="min-w-0">
            {title && (
              <div className="text-[13px] font-extrabold tracking-[-0.01em] text-slate-800 truncate">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="mt-0.5 text-[11px] font-medium text-slate-400 truncate">
                {subtitle}
              </div>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}

      <div className="min-h-0">{children}</div>
    </section>
  );
}

