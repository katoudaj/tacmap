import React, { useEffect, useState } from "react";
import { PinData } from "../models/Pin";
import { PIN_MAX_DURATION } from "../config";

interface PinLayerProps {
  pins: PinData[];
}

const PinLayer: React.FC<PinLayerProps> = ({ pins }) => {
  const [now, setNow] = useState(Date.now());

  // 1秒ごとに現在時刻更新
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {pins.map((pin) => {
        const elapsedSec = (now - pin.createdAt) / 1000;
        const opacity = Math.max(0, 1 - elapsedSec / PIN_MAX_DURATION);

        return (
          <div
            key={pin.id}
            style={{
              position: "absolute",
              left: `${pin.xRatio * 100}%`,
              top: `${pin.yRatio * 100}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: `rgba(255, 0, 0, ${opacity})`,
              color: `rgba(255, 255, 255, ${opacity})`,
              padding: "2px 4px",
              borderRadius: "4px",
              fontSize: "12px",
              pointerEvents: "none", // ピン上のクリック無効化
              transition: "opacity 0.3s linear"
            }}
          >
            {pin.tag} ({Math.floor(elapsedSec)}s)
          </div>
        );
      })}
    </>
  );
};

export default PinLayer;
