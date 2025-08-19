export type ItemType =
  | "file"
  | "video"
  | "page"
  | "link"
  | "quiz"
  | "assignment"
  | "forum"
  | "event";

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  hidden?: boolean;
  // Campo para extensões de plugins (dados arbitrários e serializáveis)
  ext?: Record<string, unknown>;
}

export interface Section {
  id: string;
  title: string;
  hidden?: boolean;
  items: Item[];
  ext?: Record<string, unknown>;
}

export interface Course {
  schemaVersion: number;     // controle de migrações
  id: string;
  title: string;
  summary?: string;
  visible: boolean;
  sections: Section[];
  ext?: Record<string, unknown>;
}

export interface EditorState {
  course: Course;
  // metadata de runtime (não serializável)
  meta: {
    dirty: boolean;
    lastUpdatedAt: number; // epoch ms
  };
}
