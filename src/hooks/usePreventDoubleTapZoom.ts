import { useEffect } from "react";

/**
 * iOS Safariなどで発生するダブルタップズームを防止するフック。
 * 2本指でのピンチ操作は妨げません。
 */
export default function usePreventDoubleTapZoom() {
  useEffect(() => {
    let lastTouch = 0;

    const preventDoubleTapZoom = (e: TouchEvent) => {
      // ピンチズーム（2本指以上）は許可
      if (e.touches.length > 1) return;

      const now = Date.now();
      if (now - lastTouch < 400) {
        e.preventDefault(); // ダブルタップズームのみ防ぐ
      }
      lastTouch = now;
    };

    // passive: false が重要（preventDefaultを有効にするため）
    document.addEventListener("touchstart", preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener("touchstart", preventDoubleTapZoom);
    };
  }, []);
}
