import { EditorState } from "./types";
import { now, clone, deepFreeze } from "./utils";
import { rootReducer, Command } from "./commands";
import { History } from "./history";
import { TypedEventEmitter, EventMap } from "./events";
import { Middleware, MiddlewareAPI, composeMiddlewares } from "./middleware";

export class EditorStore {
  private state: EditorState;
  private history: History;
  private emitter = new TypedEventEmitter<EventMap>();
  private reducer = rootReducer;
  private middlewareChain?: (cmd: Command) => void;

  constructor(
    initial: EditorState,
    opts?: { historyLimit?: number; middlewares?: Middleware[] }
  ) {
    this.state = deepFreeze(clone(initial));
    this.history = new History(opts?.historyLimit ?? 100);

    if (opts?.middlewares?.length) {
      const api: MiddlewareAPI = {
        getState: () => this.getState(),
        setState: (next, meta) => this.setState(next, meta),
        dispatch: (cmd) => this.dispatch(cmd),
      };

      // Encadeia middlewares em torno do reducer usando composeMiddlewares
      const dispatchReducer = (cmd: Command) => this.dispatchReducer(cmd);
      this.middlewareChain = composeMiddlewares(opts.middlewares)(api)(
        dispatchReducer
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Eventos                                  */
  /* -------------------------------------------------------------------------- */

  on = this.emitter.on.bind(this.emitter);
  off = this.emitter.off.bind(this.emitter);

  /* -------------------------------------------------------------------------- */
  /*                                  State API                                 */
  /* -------------------------------------------------------------------------- */

  getState(): EditorState {
    return this.state;
  }

  private setState(next: EditorState, meta?: { pushHistory?: boolean; silent?: boolean }) {
    this.state = deepFreeze(
      clone({
        ...next,
        meta: { ...next.meta, lastUpdatedAt: now(), dirty: true },
      })
    );

    if (!meta?.silent) {
      this.emitter.emit("state:changed", undefined);
      this.emitter.emit("history:changed", {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      });
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Dispatch                                  */
  /* -------------------------------------------------------------------------- */

  dispatch(cmd: Command) {
    if (this.middlewareChain) {
      this.middlewareChain(cmd);
    } else {
      this.dispatchReducer(cmd);
    }

    this.emitter.emit("command:applied", {
      type: cmd.type,
      payload: (cmd as any).payload,
    });
  }

  private dispatchReducer(cmd: Command) {
    this.history.push(this.state); // snapshot antes da mudança
    const next = this.reducer(this.state, cmd);
    this.setState(next, { pushHistory: false });
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Undo / Redo                                */
  /* -------------------------------------------------------------------------- */

  canUndo() {
    return this.history.canUndo();
  }
  canRedo() {
    return this.history.canRedo();
  }

  undo() {
    const prev = this.history.undo(this.state);
    if (prev) this.setState(prev, { pushHistory: false });
  }

  redo() {
    const next = this.history.redo(this.state);
    if (next) this.setState(next, { pushHistory: false });
  }

  /* -------------------------------------------------------------------------- */
  /*                                Transações                                  */
  /* -------------------------------------------------------------------------- */

  transaction(
    run: (dispatch: (c: Command) => void, get: () => EditorState) => void
  ) {
    const start = this.state;
    const beforeCount = this.history.snapshotCounts().past;

    run((c) => this.dispatchReducer(c), () => this.state);

    const afterCount = this.history.snapshotCounts().past;

    if (afterCount === beforeCount) {
      this.history.push(start);
    }

    this.emitter.emit("history:changed", {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }
}
