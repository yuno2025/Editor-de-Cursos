import { EditorState, Item, ItemType } from "./types";
import { move } from "./utils";
import { NotFoundError } from "./errors";

export type Command =
  | { type: "course/setTitle"; payload: { title: string } }
  | { type: "course/setSummary"; payload: { summary?: string } }
  | { type: "course/setVisible"; payload: { visible: boolean } }
  | { type: "section/add"; payload: { title?: string; sectionId?: string /* custom id opcional */ } }
  | { type: "section/remove"; payload: { sectionId: string } }
  | { type: "section/move"; payload: { sectionId: string; dir: -1 | 1 } }
  | { type: "section/toggle"; payload: { sectionId: string } }
  | { type: "item/add"; payload: { sectionId: string; type: ItemType; title?: string; itemId?: string } }
  | { type: "item/updateTitle"; payload: { sectionId: string; itemId: string; title: string } }
  | { type: "item/move"; payload: { sectionId: string; itemId: string; dir: -1 | 1 } }
  | { type: "item/toggle"; payload: { sectionId: string; itemId: string } }
  | { type: "custom"; payload: any }; // extensão por plugins

export type Reducer = (state: EditorState, cmd: Command) => EditorState;

export const rootReducer: Reducer = (state, cmd) => {
  switch (cmd.type) {
    case "course/setTitle":
      return {
        ...state,
        course: { ...state.course, title: cmd.payload.title },
      };

    case "course/setSummary":
      return {
        ...state,
        course: { ...state.course, summary: cmd.payload.summary },
      };

    case "course/setVisible":
      return {
        ...state,
        course: { ...state.course, visible: cmd.payload.visible },
      };

    case "section/add": {
      const id = cmd.payload.sectionId ?? `sec_${Date.now().toString(36)}`;
      return {
        ...state,
        course: {
          ...state.course,
          sections: [
            ...state.course.sections,
            { id, title: cmd.payload.title ?? "Nova seção", items: [] },
          ],
        },
      };
    }

    case "section/remove":
      return {
        ...state,
        course: {
          ...state.course,
          sections: state.course.sections.filter((s) => s.id !== cmd.payload.sectionId),
        },
      };

    case "section/move": {
      const idx = state.course.sections.findIndex((s) => s.id === cmd.payload.sectionId);
      if (idx < 0) throw new NotFoundError("Seção não encontrada");
      return {
        ...state,
        course: {
          ...state.course,
          sections: move(state.course.sections, idx, idx + cmd.payload.dir),
        },
      };
    }

    case "section/toggle":
      return {
        ...state,
        course: {
          ...state.course,
          sections: state.course.sections.map((s) =>
            s.id === cmd.payload.sectionId ? { ...s, hidden: !s.hidden } : s
          ),
        },
      };

    case "item/add":
      return {
        ...state,
        course: {
          ...state.course,
          sections: state.course.sections.map((sec) =>
            sec.id === cmd.payload.sectionId
              ? {
                  ...sec,
                  items: [
                    ...sec.items,
                    {
                      id: cmd.payload.itemId ?? `it_${Date.now().toString(36)}`,
                      type: cmd.payload.type,
                      title: cmd.payload.title ?? `${cmd.payload.type} novo`,
                    } as Item,
                  ],
                }
              : sec
          ),
        },
      };

    case "item/updateTitle":
      return {
        ...state,
        course: {
          ...state.course,
          sections: state.course.sections.map((sec) =>
            sec.id === cmd.payload.sectionId
              ? {
                  ...sec,
                  items: sec.items.map((it) =>
                    it.id === cmd.payload.itemId ? { ...it, title: cmd.payload.title } : it
                  ),
                }
              : sec
          ),
        },
      };

    case "item/move":
      return {
        ...state,
        course: {
          ...state.course,
          sections: state.course.sections.map((sec) => {
            if (sec.id !== cmd.payload.sectionId) return sec;
            const idx = sec.items.findIndex((it) => it.id === cmd.payload.itemId);
            if (idx < 0) throw new NotFoundError("Item não encontrado");
            return { ...sec, items: move(sec.items, idx, idx + cmd.payload.dir) };
          }),
        },
      };

    case "item/toggle":
      return {
        ...state,
        course: {
          ...state.course,
          sections: state.course.sections.map((sec) =>
            sec.id === cmd.payload.sectionId
              ? {
                  ...sec,
                  items: sec.items.map((it) =>
                    it.id === cmd.payload.itemId ? { ...it, hidden: !it.hidden } : it
                  ),
                }
              : sec
          ),
        },
      };

    case "custom":
      // Plugins podem interceptar isto via middleware antes do reducer.
      return state;

    default:
      return state;
  }
};
