import React from "react";

export function Card({ title, subtitle, right, children, className = "", accent }) {
  return (
    <section
      className={["relative overflow-hidden rounded-2xl transition-shadow duration-200", className].join(" ")}
      style={{
        background:   "#0a1f35",
        border:       "1px solid rgba(255,255,255,0.08)",
        boxShadow:    "0 2px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.25)",
      }}
    >
      {accent && (
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${accent} 0%, ${accent}44 100%)` }} />
      )}

      {(title || subtitle || right) && (
        <header
          className="flex items-start justify-between gap-3 px-5 pt-4 pb-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="min-w-0">
            {title && (
              <div className="truncate text-[13px] font-extrabold tracking-[-0.01em]"
                style={{ color: "#e2e8f0" }}>{title}</div>
            )}
            {subtitle && (
              <div className="mt-0.5 truncate text-[11px] font-medium"
                style={{ color: "#4a6080" }}>{subtitle}</div>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}

      <div className="min-h-0">{children}</div>
    </section>
  );
}
