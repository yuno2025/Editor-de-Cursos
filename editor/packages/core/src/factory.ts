import { Course, EditorState } from "./types";
import { uid } from "./ids";
import { CURRENT_SCHEMA_VERSION } from "./schema";

export function createCourse(title = "Novo curso"): Course {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: uid("course"),
    title,
    visible: true,
    sections: [],
  };
}

export function createInitialState(title = "Novo curso"): EditorState {
  return {
    course: createCourse(title),
    meta: { dirty: false, lastUpdatedAt: Date.now() },
  };
}
