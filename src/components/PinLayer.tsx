import React from "react";
import { PinData } from "../models/Pin";

interface PinLayerProps {
  pins: PinData[];
}

const PinLayer: React.FC<PinLayerProps> = ({ pins }) => {
  return (
    <>
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
    </>
  );
};

export default PinLayer;
