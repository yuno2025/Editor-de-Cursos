import { Command } from "./commands";
import { EditorState } from "./types";

/** API exposta para os middlewares interagirem com o estado */
export type MiddlewareAPI = {
  getState: () => EditorState;
  setState: (next: EditorState, meta?: { silent?: boolean }) => void;
  dispatch: (cmd: Command) => void;
};

/** Contrato dos middlewares (Redux-like) */
export type Middleware = (
  api: MiddlewareAPI
) => (next: (cmd: Command) => void) => (cmd: Command) => void;

/* -------------------------------------------------------------------------- */
/*                               COMPOSIÇÃO CORE                              */
/* -------------------------------------------------------------------------- */

/** Composição de middlewares em cadeia */
export function composeMiddlewares(middlewares: Middleware[]): Middleware {
  return (api) => {
    if (middlewares.length === 0) {
      return (next) => (cmd) => next(cmd);
    }

    const chain = middlewares.map((mw) => mw(api));

    const fallback: (cmd: Command) => void = (_cmd) => {
      // fallback no-op: não altera nada, apenas reaplica o estado
      api.setState(api.getState(), { silent: true });
    };

    // compõe middlewares em cadeia
    const composed = chain.reduceRight<(cmd: Command) => void>(
      (next, mw) => mw(next),
      fallback
    );

    return (next) => (cmd) => {
      composed(cmd);
      next(cmd);
    };
  };
}

/* -------------------------------------------------------------------------- */
/*                               MIDDLEWARES BASE                             */
/* -------------------------------------------------------------------------- */

/** Emite logs simples das ações (debug) */
export const logger: Middleware = (_api) => (next) => (cmd) => {
  // eslint-disable-next-line no-console
  console.log("[editor] command:", cmd);
  next(cmd);
};

/** Bloqueia comandos `custom` não tratados (segurança) */
export const forbidUnknownCustom: Middleware = (_api) => (next) => (cmd) => {
  if (cmd.type === "custom") {
    throw new Error(
      "Comando 'custom' bloqueado. Registre um plugin/middleware para tratá-lo."
    );
  }
  next(cmd);
};

/** Persiste estado no localStorage após cada comando */
export const persist: Middleware = (api) => (next) => (cmd) => {
  next(cmd);
  try {
    const state = api.getState();
    localStorage.setItem("editorState", JSON.stringify(state));
  } catch (err) {
    console.error("[persist] erro ao salvar estado", err);
  }
};

/** Carrega estado persistido do localStorage */
export function loadPersistedState<T>(key = "editorState"): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                         EXTENSÃO: PLUGINS CUSTOM                           */
/* -------------------------------------------------------------------------- */

type CustomHandler = (
  cmd: Command,
  api: MiddlewareAPI,
  next: (cmd: Command) => void
) => void;

/** Registra handlers para lidar com comandos `custom` */
export function customPlugin(handler: CustomHandler): Middleware {
  return (api) => (next) => (cmd) => {
    if (cmd.type === "custom") {
      handler(cmd, api, next);
    } else {
      next(cmd);
    }
  };
}
