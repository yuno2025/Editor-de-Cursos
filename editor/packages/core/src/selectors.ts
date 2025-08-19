import { EditorState, Section, Item } from "./types";

export const selectCourse = (s: EditorState) => s.course;
export const selectSections = (s: EditorState) => s.course.sections;
export const selectSectionById = (s: EditorState, id: string): Section | undefined =>
  s.course.sections.find(sec => sec.id === id);
export const selectItemById = (s: EditorState, sectionId: string, itemId: string): Item | undefined =>
  s.course.sections.find(sec => sec.id === sectionId)?.items.find(it => it.id === itemId);
