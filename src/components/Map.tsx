import React, { useState, useEffect, useRef } from "react";
import RotationController from "./RotationController";
import Legend from "./Legend";
import PinLayer from "./PinLayer";
import useAutoScale from "../hooks/useAutoScale";
import usePreventDoubleTapZoom from "../hooks/usePreventDoubleTapZoom";
import { PinManager, PinType, PinData } from "../models/Pin";
import PointerMapper from "../utils";
import TapJudge, { TapType } from "../TapJudge";

interface MapProps {
  mapSrc: string;
}

const pinManager = new PinManager();

const Map: React.FC<MapProps> = ({ mapSrc }) => {
  const [pins, setPins] = useState<PinData[]>([]);
  const [rotation, setRotation] = useState<number>(0); // 回転角度 (deg)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const scale = useAutoScale(containerRef, imgRef, rotation);
  usePreventDoubleTapZoom();
  const rotationRef = useRef(rotation);
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
  const tapJudgeRef = useRef<TapJudge | null>(null);

  // TapJudge の初期化（コンポーネントライフタイムに紐づける）
  useEffect(() => {
    tapJudgeRef.current = new TapJudge(
      (e) => PointerMapper.clientToRatio(e.currentTarget as HTMLElement, e.clientX, e.clientY, rotationRef.current, scale),
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
  }, [mapSrc, scale]);

  // ピンマネージャ購読
  useEffect(() => {
    pinManager.subscribe(setPins, mapSrc); // mapSrcをmapIdとして使用
    return () => pinManager.unsubscribeAll();
  }, [mapSrc]);

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
    await pinManager.addPin(xRatio, yRatio, pinType, mapSrc); // mapSrcをmapIdとして使用
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
          top: 24,
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
          src={mapSrc}
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
