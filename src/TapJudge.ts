export type TapType = "single" | "double" | "long";

type OperationType = "pointerDown" | "pointerMove" | "pointerUp";

type GetRatioFn = (e: any) => { xRatio: number; yRatio: number };
type OnTapFn = (type: TapType, xRatio: number, yRatio: number) => void;

export default class TapJudge {
  private getRatio: GetRatioFn;
  private onTap: OnTapFn;
  private tapTimeout: ReturnType<typeof setTimeout> | null = null;
  private startX = 0;
  private startY = 0;

  // Operation履歴
  private operations: OperationType[] = [];

  constructor(getRatio: GetRatioFn, onTap: OnTapFn, private opts = { tapMs: 250, movePx: 5 }) {
    this.getRatio = getRatio;
    this.onTap = onTap;
  }

  private judgeTap(e: any): TapType | void {
    if (this.operations.find(op => op === "pointerMove")) {
      return;
    }

    // ズーム操作の誤判定防止のために、2連続以上のpointerDownはズーム操作とみなして無効
    for (let i = 0; i < this.operations.length; i++) {
      if (this.operations[i] === "pointerDown") {
        if (i > 0 && this.operations[i - 1] === "pointerDown") { 
          return;
        } 
      }
    }

    // ロングタップ判定
    if (!this.operations.find(op => op === "pointerUp")) {
      return "long";
    }

    // ダブルタップ判定
    const pointerDowns = this.operations.filter(op => op === "pointerDown");
    if (pointerDowns.length >= 2) {
      return "double";
    }

    // シングルタップ
    return "single";
  }

  pointerDown(e: any) {
    if (!this.tapTimeout) {
      this.resetState();
      this.startX = e.clientX;
      this.startY = e.clientY;
      const { xRatio, yRatio } = this.getRatio(e);
      
      this.tapTimeout = setTimeout(() => {
        const tapType = this.judgeTap(e);
        if (tapType === "single") this.onTap("single", xRatio, yRatio);
        else if (tapType === "double") this.onTap("double", xRatio, yRatio);
        else if (tapType === "long") this.onTap("long", xRatio, yRatio);

        this.resetState();
      }, 
      this.opts.tapMs);
    }

    this.operations.push("pointerDown");
  }

  pointerMove(e: any) {
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    if (Math.sqrt(dx * dx + dy * dy) > this.opts.movePx) {
      this.operations.push("pointerMove");
    }
  }

  pointerUp(_e: any) {
    this.operations.push("pointerUp");
  }

  dispose() {
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
      this.tapTimeout = null;
    }
    this.resetState();
  }

  private resetState() {
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
      this.tapTimeout = null;
    }

    this.operations = [];
  }
}