import React, { useRef } from "react";
import { PinData, PinType } from "../models/Pin";
import { PIN_MAX_DURATION } from "../config"; 

interface PinLayerProps {
  pins: PinData[];
  rotation?: number;
  onRemovePin?: (id: string) => void; // 追加: 削除コールバック
  longPressMs?: number;
}

const colorMap: Record<PinType, string> = {
  enemy: "red",
  ally: "blue",
  general: "orange"
};

const DEFAULT_PIN_SIZE = 24; // （px）
const DEFAULT_LONG_PRESS_MS = 600;

const PinLayer: React.FC<PinLayerProps> = ({ pins, rotation = 0, onRemovePin, longPressMs = DEFAULT_LONG_PRESS_MS }) => {
  const timersRef = useRef<Record<string, number | null>>({});

  const startLongPress = (id: string) => (e: React.PointerEvent) => {
    if (!onRemovePin) return;
    e.preventDefault();
    e.stopPropagation(); // 親へバブリングさせない
    const prev = timersRef.current[id];
    if (prev) {
      window.clearTimeout(prev);
    }
    timersRef.current[id] = window.setTimeout(() => {
      onRemovePin(id);
      timersRef.current[id] = null;
    }, longPressMs);
  };

  const cancelLongPress = (id: string) => (e?: React.PointerEvent) => {
    if (e) {
      e.stopPropagation(); // 親へ伝わるのを防ぐ
    }
    const t = timersRef.current[id];
    if (t) {
      window.clearTimeout(t);
      timersRef.current[id] = null;
    }
  };

  return (
    <>
      {pins.map((pin) => {
        const elapsedMs = Date.now() - pin.createdAt;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        // 透明度を計算（0〜1）
        let opacity = 1 - elapsedMs / (PIN_MAX_DURATION * 1000);
        if (opacity < 0) opacity = 0;

        const size = DEFAULT_PIN_SIZE;
        const fontSize = Math.max(10, Math.floor(size * 0.45));

        return (
          <div
            key={pin.id}
            onPointerDown={startLongPress(pin.id)}
            onPointerUp={cancelLongPress(pin.id)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              position: "absolute",
              left: `${pin.xRatio * 100}%`,
              top: `${pin.yRatio * 100}%`,
              transform: "translate(-50%, -50%)",
              width: `${size}px`,
              height: `${size}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colorMap[pin.tag],
              fontWeight: "bold",
              fontSize: `${fontSize}px`,
              opacity: opacity,
              userSelect: "none",
              cursor: onRemovePin ? "pointer" : "default"
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `rotate(${-rotation}deg)`,
                transformOrigin: "center center",
                lineHeight: 1
              }}
            >
              {elapsedSeconds}
            </span>
          </div>
        );
      })}
    </>
  );
};

export default PinLayer;
