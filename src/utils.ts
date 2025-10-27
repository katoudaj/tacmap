export default class PointerMapper {
  // client座標（ページ座標）と要素、回転角度を渡すと正規化された比率を返す
  static clientToRatio(el: HTMLElement, clientX: number, clientY: number, rotationDeg: number, scale: number) {
    const rect = el.getBoundingClientRect();

    // 要素中心を基準にローカル座標
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const localX = (clientX - cx) / scale;
    const localY = (clientY - cy) / scale;

    // 回転を逆適用（-rotation）
    const rad = (rotationDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = localX * cos + localY * sin;
    const ry = -localX * sin + localY * cos;

    // 要素のレイアウトサイズで正規化
    const w = el.clientWidth;
    const h = el.clientHeight;
    const xRatio = 0.5 + rx / w;
    const yRatio = 0.5 + ry / h;

    return { xRatio, yRatio };
  }
}