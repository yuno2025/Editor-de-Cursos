import { Course, EditorState } from "./types";
import { CURRENT_SCHEMA_VERSION, migrateCourse, validateCourse } from "./schema";

export function toJSON(state: EditorState): string {
  const serializable: Course = {
    ...state.course,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
  // meta é efêmero e não vai para JSON
  return JSON.stringify(serializable);
}

export function fromJSON(json: string): EditorState {
  const raw = JSON.parse(json);
  const course = migrateCourse(raw);
  validateCourse(course);
  return {
    course,
    meta: { dirty: false, lastUpdatedAt: Date.now() },
  };
}
