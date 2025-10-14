import React from "react";

interface LegendItem {
  color: string;
  label: string;
}

interface LegendProps {
  items: LegendItem[];
  style?: React.CSSProperties;
}

const Legend: React.FC<LegendProps> = ({ items, style }) => {
  return (
    <div
      style={{
        borderRadius: "8px",
        padding: "6px 10px",
        fontSize: "0.9rem",
        lineHeight: "1.4",
        ...style,
      }}
    >
      {items.map((item, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 8,
              backgroundColor: item.color,
              border: "1px solid #333",
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
