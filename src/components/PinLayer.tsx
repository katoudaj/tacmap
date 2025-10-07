import React from "react";
import { PinData, PinType } from "../models/Pin";
import { PIN_MAX_DURATION } from "../config"; // 最大表示秒数（例: 20秒）

interface PinLayerProps {
  pins: PinData[];
}

const colorMap: Record<PinType, string> = {
  enemy: "red",
  ally: "blue",
  general: "orange"
};

const PinLayer: React.FC<PinLayerProps> = ({ pins }) => {
  return (
    <>
      {pins.map((pin) => {
        const elapsedMs = Date.now() - pin.createdAt;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        // 透明度を計算（0〜1）
        let opacity = 1 - elapsedMs / (PIN_MAX_DURATION * 1000);
        if (opacity < 0) opacity = 0;

        return (
          <div
            key={pin.id}
            style={{
              position: "absolute",
              left: `${pin.xRatio * 100}%`,
              top: `${pin.yRatio * 100}%`,
              transform: "translate(-50%, -50%)",
              color: colorMap[pin.tag],
              fontWeight: "bold",
              opacity: opacity,
              pointerEvents: "none",
              userSelect: "none"
            }}
          >
            {elapsedSeconds}
          </div>
        );
      })}
    </>
  );
};

export default PinLayer;
