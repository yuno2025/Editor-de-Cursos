import { Command } from "./commands";
import { EditorState } from "./types";

/**
 * Plugins podem registrar handlers para comandos "custom" e também
 * expor utilitários (ex.: validação de ext, migrações específicas).
 */
export interface PluginContext {
  getState(): EditorState;
  setState(next: EditorState): void;
  dispatch(cmd: Command): void;
}

export interface Plugin {
  name: string;
  onCommand?(ctx: PluginContext, cmd: Command): boolean | void;
}

export class PluginRegistry {
  private plugins: Plugin[] = [];

  use(plugin: Plugin) {
    this.plugins.push(plugin);
    return this;
  }

  handle(ctx: PluginContext, cmd: Command): boolean {
    for (const p of this.plugins) {
      if (p.onCommand) {
        const handled = p.onCommand(ctx, cmd);
        if (handled === true) return true;
      }
    }
    return false;
  }
}
