import React from "react";

export function Sparkline({
  data,
  color = "rgba(255,255,255,0.8)",
  width = 120,
  height = 28,
}) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 4;

  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const fillPts = `0,${height} ${pts} ${width},${height}`;

  return (
    <svg width={width} height={height} className="block">
      <polyline points={fillPts} fill={color} fillOpacity={0.15} stroke="none" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

