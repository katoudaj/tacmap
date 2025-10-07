import React, { useState, useEffect, useRef } from "react";
import PinLayer from "./PinLayer";
import { PinManager, PinType, PinData } from "../models/Pin";

const pinManager = new PinManager();

const TAP_THRESHOLD = 250; // ms
const MOVE_THRESHOLD = 5; // px

const Map: React.FC = () => {
  const [pins, setPins] = useState<PinData[]>([]);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  const tapJudgeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isJudging = useRef(false);

  // ドラッグ判定用
  const startX = useRef(0);
  const startY = useRef(0);
  const moved = useRef(false);

  // ダブルタップ判定用
  const doubleTapped = useRef(false);

  // 長押し判定用
  const maybeLongPress = useRef(false);

  useEffect(() => {
    pinManager.subscribe(setPins);
    return () => pinManager.unsubscribeAll();
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isJudging.current) {
      doubleTapped.current = true;
      return;
    }
    isJudging.current = true;

    maybeLongPress.current = true;

    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    // タップ判定
    tapJudgeTimeout.current = setTimeout(() => {
      // 動いていた場合は無視
      if (moved.current) {
        // 動いていた場合は無視
      } 
      else if (doubleTapped.current) {
        // ダブルタップ確定
        addPin(xRatio, yRatio, PinType.Enemy);
      }
      else if (maybeLongPress.current) {
        // 長押し確定
        addPin(xRatio, yRatio, PinType.General);
      }
      else {
        // シングルタップ確定
        addPin(xRatio, yRatio, PinType.Ally);
      }

      // リセット
      isJudging.current = false;
      doubleTapped.current = false;
      maybeLongPress.current = false;
      tapJudgeTimeout.current = null;
      moved.current = false;
    }, TAP_THRESHOLD);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isJudging.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      moved.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    maybeLongPress.current = false;
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
      onPointerMove={handlePointerMove}
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
