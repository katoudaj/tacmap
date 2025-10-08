import React, { useState, useEffect, useRef } from "react";
import PinLayer from "./PinLayer";
import { PinManager, PinType, PinData } from "../models/Pin";

const pinManager = new PinManager();

const TAP_THRESHOLD = 250; // ms
const MOVE_THRESHOLD = 5; // px

const Map: React.FC = () => {
  const [pins, setPins] = useState<PinData[]>([]);
  const [rotation, setRotation] = useState<number>(0); // 回転角度 (deg)
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    let lastTouch = 0;

    const preventDoubleTapZoom = (e: TouchEvent) => {
      // 2本指のピンチは無視
      if (e.touches.length > 1) return;

      const now = Date.now();
      if (now - lastTouch < 400) {
        e.preventDefault(); // ダブルタップズームだけ防ぐ
      }
      lastTouch = now;
    };

    // touchstart にイベント登録、passive: false 必須
    document.addEventListener("touchstart", preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener("touchstart", preventDoubleTapZoom);
    };
  }, []);

  const rotateBy = (deg: number) => {
    setRotation((r) => {
      const next = (r + deg) % 360;
      return next < 0 ? next + 360 : next;
    });
  };
  const rotateLeft = () => rotateBy(-90);
  const rotateRight = () => rotateBy(90);
  const resetRotation = () => setRotation(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isJudging.current) {
      doubleTapped.current = true;
      return;
    }
    isJudging.current = true;

    maybeLongPress.current = true;

    // スタート座標セット（ドラッグ判定用）
    startX.current = e.clientX;
    startY.current = e.clientY;
    moved.current = false;

    const rect = e.currentTarget.getBoundingClientRect();

    // 回転を考慮して、クリック点を逆回転してから比率計算する
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const localX = e.clientX - cx;
    const localY = e.clientY - cy;

    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // 逆回転（-rotation）を適用した座標
    const rx = localX * cos + localY * sin;
    const ry = -localX * sin + localY * cos;

    // 正規化は回転前の要素サイズ（layout サイズ）を使う
    const w = (e.currentTarget as HTMLElement).clientWidth;
    const h = (e.currentTarget as HTMLElement).clientHeight;
    const xRatio = 0.5 + rx / w;
    const yRatio = 0.5 + ry / h;

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
    <div style={{ position: "relative", width: "100%", touchAction: "manipulation"}}>
      {/* 回転ボタン群 */}
      <div style={{ position: "absolute", top: 8, left: 8, zIndex: 50, display: "flex", gap: 6 }}>
        <button onClick={rotateLeft} aria-label="左回転">⟲</button>
        <button onClick={resetRotation} aria-label="回転リセット">⟳0°</button>
        <button onClick={rotateRight} aria-label="右回転">⟳</button>
      </div>

      {/* 回転をかけるラッパー。transform-origin を中心に指定 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
        }}
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
        <PinLayer pins={pins} rotation={rotation} />
      </div>
    </div>
  );
};

export default Map;
