import React from "react";

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      borderRadius:    "14px",
      background:      "rgba(8,18,32,0.97)",
      border:          "1px solid rgba(255,255,255,0.12)",
      padding:         "12px 16px",
      boxShadow:       "0 12px 40px rgba(0,0,0,0.6)",
      minWidth:        "150px",
      backdropFilter:  "blur(12px)",
    }}>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a6080", marginBottom: "8px", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {payload.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "3px", flexShrink: 0, background: p.color || p.stroke || p.fill }} />
            <span style={{ fontSize: "12px", color: "#7c9ab8" }}>{p.name}:</span>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#e2e8f0" }}>{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
