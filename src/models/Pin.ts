import { db } from "../firebase";
import { collection, doc, onSnapshot, query, orderBy, deleteDoc, setDoc } from "firebase/firestore";
import { PIN_MAX_DURATION } from "../config";

export enum PinType {
  Enemy = "enemy",
  Ally = "ally",
  General = "general"
}

export interface PinData {
  id: string;
  xRatio: number;
  yRatio: number;
  tag: PinType;
  createdAt: number;
}

export class PinManager {
  private pins: PinData[] = [];
  private unsubscribe: (() => void) | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {}

  getAll(): PinData[] {
    return this.pins;
  }

  private async removeExpiredPins() {
    const now = Date.now();
    for (const pin of this.pins) {
      if (now - pin.createdAt >= PIN_MAX_DURATION * 1000) {
        try {
          await deleteDoc(doc(db, "pins", pin.id));
        } catch (err) {
          console.error("Failed to delete pin:", err);
        }
      }
    }
  }

  subscribe(callback: (pins: PinData[]) => void) {
    const q = query(collection(db, "pins"), orderBy("createdAt"));
    this.unsubscribe = onSnapshot(q, async (snapshot) => {
      this.pins = snapshot.docs.map(doc => doc.data() as PinData);

      // 取得時に古いピンを削除
      await this.removeExpiredPins();

      // コールバックは常に最新の pins
      callback(this.pins.filter(pin => Date.now() - pin.createdAt < PIN_MAX_DURATION * 1000));
    });

    // 毎秒チェックして削除
    this.cleanupInterval = setInterval(async () => {
      await this.removeExpiredPins();
      callback(this.pins.filter(pin => Date.now() - pin.createdAt < PIN_MAX_DURATION * 1000));
    }, 1000);
  }

  unsubscribeAll() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }

  async add(pin: PinData) {
    try {
      await setDoc(doc(db, "pins", pin.id), pin);
    } catch (err) {
      console.error("Failed to add pin:", err);
    }
  }

  async addPin(xRatio: number, yRatio: number, type: PinType) {
    const pin: PinData = {
        id: Date.now().toString(),
        xRatio,
        yRatio,
        tag: type,
        createdAt: Date.now()
    };
    await setDoc(doc(db, "pins", pin.id), pin);
  }
}
