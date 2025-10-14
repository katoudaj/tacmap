import React, { useState, useEffect, useRef } from "react";
import PinLayer from "./PinLayer";
import { PinManager, PinType, PinData } from "../models/Pin";
import PointerMapper from "../utils";
import TapJudge, { TapType } from "../TapJudge";
import useAutoScale from "../hooks/useAutoScale";

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
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100vh", touchAction: "manipulation", overflow: "hidden"}}>
      {/* 回転ボタン群 */}
      <div style={{ position: "absolute", top: 8, left: 8, zIndex: 50, display: "flex", gap: 6 }}>
        <button onClick={rotateLeft} aria-label="左回転">⟲</button>
        <button onClick={resetRotation} aria-label="回転リセット">⟳0°</button>
        <button onClick={rotateRight} aria-label="右回転">⟳</button>
      </div>

      {/* ピンの凡例 */}
      <div style={{
        position: "absolute",
        top: 6,
        right: 6,
        zIndex: 50,
        padding: "6px 8px",
        fontSize: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: "blue",  }} />
          <span>味方: タップ</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: "red", }} />
          <span>敵: ダブルタップ</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: "orange", }} />
          <span>汎用: 長押し</span>
        </div>
      </div>

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
          // 最大サイズの枠に合わせて中央に置くために inline-block 幅自動
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
