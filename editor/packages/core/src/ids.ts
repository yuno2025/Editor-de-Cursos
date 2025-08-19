// Gera IDs estáveis com fallback (Node/Browser)
let counter = 0;
export function uid(prefix = "id"): string {
  // Usa crypto.randomUUID quando disponível
  const g =
    typeof globalThis !== "undefined" &&
    (globalThis as any).crypto &&
    typeof (globalThis as any).crypto.randomUUID === "function"
      ? (globalThis as any).crypto.randomUUID()
      : `${Date.now().toString(36)}_${(++counter).toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 8)}`;
  return `${prefix}_${g}`;
}
