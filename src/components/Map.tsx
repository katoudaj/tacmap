import React, { useState, useEffect, useRef } from "react";
import RotationController from "./RotationController";
import Legend from "./Legend";
import useAutoScale from "../hooks/useAutoScale";
import PinLayer from "./PinLayer";
import { PinManager, PinType, PinData } from "../models/Pin";
import PointerMapper from "../utils";
import TapJudge, { TapType } from "../TapJudge";

const pinManager = new PinManager();

const Map: React.FC = () => {
  const [pins, setPins] = useState<PinData[]>([]);
  const [rotation, setRotation] = useState<number>(0); // 回転角度 (deg)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const scale = useAutoScale(containerRef, imgRef, rotation);
  const rotationRef = useRef(rotation);
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
  const tapJudgeRef = useRef<TapJudge | null>(null);

  // TapJudge の初期化（コンポーネントライフタイムに紐づける）
  useEffect(() => {
    tapJudgeRef.current = new TapJudge(
      (e) => PointerMapper.clientToRatio(e.currentTarget as HTMLElement, e.clientX, e.clientY, rotationRef.current),
      (type: TapType, xRatio: number, yRatio: number) => {
        // Tap 判定結果が返ってくる場所
        if (type === "double") addPin(xRatio, yRatio, PinType.Enemy);
        else if (type === "long") addPin(xRatio, yRatio, PinType.General);
        else addPin(xRatio, yRatio, PinType.Ally);
      }
    );
    return () => {
      tapJudgeRef.current?.dispose();
      tapJudgeRef.current = null;
    };
  }, []);

  // ピンマネージャ購読
  useEffect(() => {
    pinManager.subscribe(setPins);
    return () => pinManager.unsubscribeAll();
  }, []);

  // iOSのダブルタップズーム防止
  useEffect(() => {
    let lastTouch = 0;

    const preventDoubleTapZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      const now = Date.now();
      if (now - lastTouch < 400) e.preventDefault();
      lastTouch = now;
    };

    document.addEventListener("touchstart", preventDoubleTapZoom, { passive: false });
    return () => document.removeEventListener("touchstart", preventDoubleTapZoom);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    tapJudgeRef.current?.pointerDown(e);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    tapJudgeRef.current?.pointerMove(e);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    tapJudgeRef.current?.pointerUp(e);
  };

  const addPin = async (xRatio: number, yRatio: number, pinType: PinType) => {
    await pinManager.addPin(xRatio, yRatio, pinType);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        touchAction: "manipulation",
        overflow: "hidden",
      }}
    >
      <RotationController 
        onChange={setRotation} 
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 50,
        }} 
      />

      <Legend
        items={[
          { color: "blue", label: "味方: タップ" },
          { color: "red", label: "敵: ダブルタップ" },
          { color: "orange", label: "汎用: 長押し" },
        ]}
        style={{
          position: "absolute",
          top: 8,
          right: 8, 
          zIndex: 50,
        }}
      />

      {/* 回転＋縮小をかけるラッパー。中心で回転・拡縮 */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%,-50%) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: "center center",
          display: "inline-block",
          zIndex: 1,
          pointerEvents: "auto"
        }}
      >
        <img
          ref={imgRef}
          src="/maps/blkfox.png"
          alt="Map"
          style={{ 
            width: "auto",
            height: "auto",
            maxWidth: "100vw",
            maxHeight: "100vh",
            display: "block", 
            objectFit: "contain", 
            pointerEvents: "none",
            userSelect: "none",
            WebkitUserSelect: "none"
          }}
        />
        <PinLayer
          pins={pins}
          rotation={rotation}
          onRemovePin={(id) => pinManager.remove(id)}
        />
      </div>
    </div>
  );
};

export default Map;
