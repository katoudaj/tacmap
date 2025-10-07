// src/components/Map.tsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

type Pin = {
  id: string;
  xRatio: number;
  yRatio: number;
  tag: string;
  createdAt: any;
};

const Map: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);

  const mapPath = "/maps/blkfox.png";

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pins"), (snapshot) => {
      const newPins: Pin[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Pin, "id">)
      }));
      setPins(newPins);
    });

    return () => unsubscribe();
  }, []);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;
    const tag = prompt("タグを入力してください", "ENEMY") || "ENEMY";

    await addDoc(collection(db, "pins"), {
      xRatio,
      yRatio,
      tag,
      createdAt: serverTimestamp()
    });
  };

  return (
    <div
      style={{ position: "relative", width: "800px", height: "600px" }}
      onClick={handleClick}
    >
      <img
        src={mapPath}
        alt="Map"
        style={{
          width: "100%", // 親の幅に合わせる
          height: "auto", // 高さを自動調整
          display: "block"
        }}
      />
      {pins.map((pin) => (
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
          {pin.tag}
        </div>
      ))}
    </div>
  );
};

export default Map;
