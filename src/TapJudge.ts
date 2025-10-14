export type TapType = "single" | "double" | "long";

type GetRatioFn = (e: any) => { xRatio: number; yRatio: number };
type OnTapFn = (type: TapType, xRatio: number, yRatio: number) => void;

export default class TapJudge {
  private getRatio: GetRatioFn;
  private onTap: OnTapFn;
  private tapTimeout: ReturnType<typeof setTimeout> | null = null;
  private isJudging = false;
  private doubleTapped = false;
  private maybeLongPress = false;
  private moved = false;
  private startX = 0;
  private startY = 0;

  constructor(getRatio: GetRatioFn, onTap: OnTapFn, private opts = { tapMs: 250, movePx: 5 }) {
    this.getRatio = getRatio;
    this.onTap = onTap;
  }

  pointerDown(e: any) {
    if (this.isJudging) {
      this.doubleTapped = true;
      return;
    }
    this.isJudging = true;
    this.maybeLongPress = true;
    this.moved = false;
    this.startX = e.clientX;
    this.startY = e.clientY;

    const { xRatio, yRatio } = this.getRatio(e);

    this.tapTimeout = setTimeout(() => {
      if (this.moved) {
        // ignore
      } else if (this.doubleTapped) {
        this.onTap("double", xRatio, yRatio);
      } else if (this.maybeLongPress) {
        this.onTap("long", xRatio, yRatio);
      } else {
        this.onTap("single", xRatio, yRatio);
      }

      this.resetState();
    }, this.opts.tapMs);
  }

  pointerMove(e: any) {
    if (!this.isJudging) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    if (Math.sqrt(dx * dx + dy * dy) > this.opts.movePx) {
      this.moved = true;
    }
  }

  pointerUp(_e: any) {
    this.maybeLongPress = false;
  }

  dispose() {
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
      this.tapTimeout = null;
    }
    this.resetState();
  }

  private resetState() {
    this.isJudging = false;
    this.doubleTapped = false;
    this.maybeLongPress = false;
    this.moved = false;
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
      this.tapTimeout = null;
    }
  }
}