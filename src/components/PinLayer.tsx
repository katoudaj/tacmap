import React, { useEffect, useState } from "react";
import { PinData } from "../models/Pin";

interface PinLayerProps {
  pins: PinData[];
}

const PinLayer: React.FC<PinLayerProps> = ({ pins }) => {
  const [now, setNow] = useState(Date.now());

  // 1秒ごとに更新して経過時間を表示
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {pins.map((pin) => {
        const elapsedSec = Math.floor((now - pin.createdAt) / 1000);
        return (
          <div
            key={pin.id}
            style={{
              position: "absolute",
              left: `${pin.xRatio * 100}%`,
              top: `${pin.yRatio * 100}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: "red",
              color: "white",
              padding: "2px 4px",
              borderRadius: "4px",
              fontSize: "12px"
            }}
          >
            {pin.tag} ({elapsedSec}s)
          </div>
        );
      })}
    </>
  );
};

export default PinLayer;
