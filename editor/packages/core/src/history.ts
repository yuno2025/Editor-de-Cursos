import { EditorState } from "./types";

export interface HistorySnapshot {
  state: EditorState;
}

export class History {
  private past: HistorySnapshot[] = [];
  private future: HistorySnapshot[] = [];
  private limit: number;

  constructor(limit = 100) {
    this.limit = limit;
  }

  push(s: EditorState) {
    this.past.push({ state: s });
    if (this.past.length > this.limit) this.past.shift();
    this.future.length = 0; // limpar redo a cada nova ação
  }

  canUndo() { return this.past.length > 0; }
  canRedo() { return this.future.length > 0; }

  undo(current: EditorState): EditorState | null {
    if (!this.canUndo()) return null;
    const last = this.past.pop()!;
    this.future.push({ state: current });
    return last.state;
  }

  redo(current: EditorState): EditorState | null {
    if (!this.canRedo()) return null;
    const next = this.future.pop()!;
    this.past.push({ state: current });
    return next.state;
  }

  clear() {
    this.past.length = 0;
    this.future.length = 0;
  }

  snapshotCounts() {
    return { past: this.past.length, future: this.future.length };
  }
}
