import React, { useState, useEffect, useRef } from "react";
import PinLayer from "./PinLayer";
import { PinManager, PinType, PinData } from "../models/Pin";

const pinManager = new PinManager();

const TAP_THRESHOLD = 250; // ms

const Map: React.FC = () => {
  const [pins, setPins] = useState<PinData[]>([]);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    pinManager.subscribe(setPins);
    return () => pinManager.unsubscribeAll();
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    // 長押し判定
    longPressTimeout.current = setTimeout(() => {
      addPin(xRatio, yRatio, PinType.General);
      longPressTimeout.current = null;
    }, TAP_THRESHOLD);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;

      const now = Date.now();
      const delta = now - lastTap.current;

      const rect = e.currentTarget.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width;
      const yRatio = (e.clientY - rect.top) / rect.height;

      if (delta < TAP_THRESHOLD) {
        // ダブルタップ
        addPin(xRatio, yRatio, PinType.Enemy);
        lastTap.current = 0; // リセット
      } else {
        // シングルタップ（少し遅延させてダブルタップ判定）
        clickTimeout.current = setTimeout(() => {
          addPin(xRatio, yRatio, PinType.Ally);
        }, TAP_THRESHOLD);
        lastTap.current = now;
      }
    }
  };

  const addPin = async (xRatio: number, yRatio: number, pinType: PinType) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    await pinManager.addPin(xRatio, yRatio, pinType);
  };

  return (
    <div
      style={{ position: "relative", width: "100%"}}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <img
        src="/maps/blkfox.png"
        alt="Map"
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "contain", 
          display: "block", 
          pointerEvents: "none",
          userSelect: "none",
          WebkitUserSelect: "none"
        }}
      />
      <PinLayer pins={pins} />
    </div>
  );
};

export default Map;
