import { Course, Section, Item, ItemType } from "./types";
import { ValidationError } from "./errors";

export const CURRENT_SCHEMA_VERSION = 1;

const ITEM_TYPES: ItemType[] = [
  "file","video","page","link","quiz","assignment","forum","event"
];

export function validateItem(it: Item) {
  if (!it || typeof it !== "object") throw new ValidationError("Item inválido");
  if (!it.id) throw new ValidationError("Item sem id");
  if (!ITEM_TYPES.includes(it.type)) throw new ValidationError(`Tipo inválido: ${it.type}`);
  if (typeof it.title !== "string") throw new ValidationError("Item.title deve ser string");
}

export function validateSection(sec: Section) {
  if (!sec.id) throw new ValidationError("Section sem id");
  if (typeof sec.title !== "string") throw new ValidationError("Section.title deve ser string");
  if (!Array.isArray(sec.items)) throw new ValidationError("Section.items deve ser array");
  sec.items.forEach(validateItem);
}

export function validateCourse(c: Course) {
  if (!c) throw new ValidationError("Curso nulo");
  if (typeof c.schemaVersion !== "number") throw new ValidationError("schemaVersion ausente");
  if (!c.id) throw new ValidationError("course.id ausente");
  if (typeof c.title !== "string") throw new ValidationError("course.title deve ser string");
  if (typeof c.visible !== "boolean") throw new ValidationError("course.visible deve ser boolean");
  if (!Array.isArray(c.sections)) throw new ValidationError("course.sections deve ser array");
  c.sections.forEach(validateSection);
}

export function migrateCourse(c: any): Course {
  // Estrutura de migrações por versão
  let cur = { ...c };
  if (typeof cur.schemaVersion !== "number") {
    // Pré-versão: assumir 0 -> subir para 1
    cur.schemaVersion = 0;
  }

  if (cur.schemaVersion === 0) {
    // Exemplo de migração: garantir visible e ext
    if (typeof cur.visible !== "boolean") cur.visible = true;
    if (!cur.ext) cur.ext = {};
    cur.schemaVersion = 1;
  }

  // Futuras migrações: while(cur.schemaVersion < CURRENT_SCHEMA_VERSION) { ... }

  validateCourse(cur);
  return cur as Course;
}
