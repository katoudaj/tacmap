import { useEffect, useState, RefObject } from "react";

export default function useAutoScale(
  containerRef: RefObject<HTMLElement | null>,
  imgRef: RefObject<HTMLImageElement | null>,
  rotation: number
) {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const computeScale = () => {
      const container = containerRef.current;
      const img = imgRef.current;
      if (!container || !img) return;

      const w = img.clientWidth;
      const h = img.clientHeight;

      const rad = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));

      const rotatedW = cos * w + sin * h;
      const rotatedH = sin * w + cos * h;

      const cw = container.clientWidth;
      const ch = container.clientHeight;

      const s = Math.min(1, cw / rotatedW, ch / rotatedH);
      setScale(s);
    };

    computeScale();
    const ro = new ResizeObserver(computeScale);
    if (containerRef.current) ro.observe(containerRef.current);
    if (imgRef.current) ro.observe(imgRef.current);
    window.addEventListener("orientationchange", computeScale);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", computeScale);
    };
  }, [containerRef, imgRef, rotation]);

  return scale;
}