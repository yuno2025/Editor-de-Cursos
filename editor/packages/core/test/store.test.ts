import { EditorStore } from "../src/store";
import { logger, forbidUnknownCustom, customPlugin } from "../src/middleware";
import { Command } from "../src/commands";
import { EditorState } from "../src/types";

/* -------------------------------------------------------------------------- */
/*                               ESTADO INICIAL                               */
/* -------------------------------------------------------------------------- */
const initialState: EditorState = {
  course: {
    id: "c1",
    title: "Novo curso",
    summary: "",
    visible: true,
    schemaVersion: 1, // 🔥 obrigatório
    sections: [],     // 🔥 obrigatório
  },
  meta: { lastUpdatedAt: Date.now(), dirty: false },
};

/* -------------------------------------------------------------------------- */
/*                          CRIAÇÃO DO STORE + MWS                            */
/* -------------------------------------------------------------------------- */
const store = new EditorStore(initialState, {
  middlewares: [
    // 1. logger → sempre roda primeiro (debug)
    logger,

    // 2. customPlugin → intercepta comandos custom antes de bloquear
    customPlugin((cmd, api, next) => {
      console.log("⚡ custom handler pegou:", cmd);
      // se quiser que outros middlewares processem, chame next(cmd)
      // aqui vamos parar o fluxo para não cair no forbidUnknownCustom
    }),

    // 3. segurança: bloqueia custom desconhecidos
    forbidUnknownCustom,

    // 4. persist -> só funciona em browser (localStorage)
    // persist,
  ],
});

/* -------------------------------------------------------------------------- */
/*                                   TESTES                                   */
/* -------------------------------------------------------------------------- */
function testValidCommand() {
  const cmd: Command = { type: "section/add", payload: { title: "Semana 1" } };
  console.log("\n✅ Teste 1: comando válido");
  store.dispatch(cmd);
}

function testCustomCommand() {
  const customCmd: Command = { type: "custom", payload: { hello: "world" } };
  console.log("\n✅ Teste 2: comando custom");
  store.dispatch(customCmd);
}

function testUndoRedo() {
  console.log("\n✅ Teste 3: undo/redo");
  store.undo();
  store.redo();
}

/* -------------------------------------------------------------------------- */
/*                                   RUN                                      */
/* -------------------------------------------------------------------------- */
testValidCommand();
testCustomCommand();
testUndoRedo();
