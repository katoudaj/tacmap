import React, { useState, useRef, useEffect } from "react";

interface RotationControllerProps {
  onChange: (rotation: number) => void; // Map側に回転角度を通知
  style?: React.CSSProperties;
}

const RotationController: React.FC<RotationControllerProps> = ({ onChange, style }) => {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    rotationRef.current = rotation;
    onChange(rotation);
  }, [rotation, onChange]);

  const rotateBy = (deg: number) => {
    setRotation((r) => {
      const next = (r + deg) % 360;
      return next < 0 ? next + 360 : next;
    });
  };

  const rotateLeft = () => rotateBy(-90);
  const rotateRight = () => rotateBy(90);
  const resetRotation = () => setRotation(0);

  return (
    <div style={{ 
        display: "flex", 
        gap: 6,
        ...style
      }}>
      <button onClick={rotateLeft}>⟲</button>
      <button onClick={resetRotation}>⟳0°</button>
      <button onClick={rotateRight}>⟳</button>
    </div>
  );
};

export default RotationController;
