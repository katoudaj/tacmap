import React, { useState, useEffect } from "react";
import PinLayer from "./PinLayer";
import { PinManager, PinData } from "../models/Pin";

const pinManager = new PinManager();

const Map: React.FC = () => {
  const [pins, setPins] = useState<PinData[]>([]);

  useEffect(() => {
    pinManager.subscribe(setPins);
    return () => pinManager.unsubscribeAll();
  }, []);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;
    const tag = prompt("タグを入力") || "Unknown";

    await pinManager.add({
      id: Date.now().toString(),
      xRatio,
      yRatio,
      tag,
      createdAt: Date.now()
    });
  };

  return (
    <div
      style={{ position: "relative", width: "800px", aspectRatio: "4/3" }}
      onClick={handleClick}
    >
      <img
        src="/maps/blkfox.png"
        alt="Map"
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
      <PinLayer pins={pins} />
    </div>
  );
};

export default Map;
