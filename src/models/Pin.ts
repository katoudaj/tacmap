// src/models/Pin.ts
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

export interface PinData {
  id: string;
  xRatio: number;
  yRatio: number;
  tag: string;
  createdAt: number;
}

export class PinManager {
  private pins: PinData[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor(initialPins: PinData[] = []) {
    this.pins = initialPins;
  }

  getAll(): PinData[] {
    return this.pins;
  }

  subscribe(callback: (pins: PinData[]) => void) {
    const q = query(collection(db, "pins"), orderBy("createdAt"));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.pins = snapshot.docs.map((doc) => doc.data() as PinData);
      callback(this.pins);
    });
  }

  unsubscribeAll() {
    if (this.unsubscribe) this.unsubscribe();
  }

  async add(pin: PinData) {
    await addDoc(collection(db, "pins"), pin);
  }
}
