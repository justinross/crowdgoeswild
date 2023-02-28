import { insertSentReaction, displayVibeCheck } from "./events";
import { id as moduleId } from "../../../public/module.json";
import { recordVibeCheckResponse } from "./VibeCheckPopup";

export function registerSocketEvents() {
  game.socket.on(`module.${moduleId}`, handleSocketEvent);
}

export async function emitSocketEvent({ type, payload }) {
  let event = {
    type,
    payload,
  };
  await game.socket.emit(`module.${moduleId}`, event);
  handleSocketEvent(event);
}

export async function sendReactionToSocket(reactionId) {
  emitSocketEvent({
    type: "icon",
    payload: reactionId,
  });
}

export async function reloadAllClients() {
  emitSocketEvent({
    type: "reload",
    payload: "",
  });
}

export async function sendVibeCheckResponse(userId, responseId) {
  emitSocketEvent({
    type: "vibecheckresponse",
    payload: { user: userId, response: responseId },
  });
}

export async function initiateVibeCheck() {
  emitSocketEvent({
    type: "vibecheck",
    payload: "",
  });
}

function handleSocketEvent({ type, payload }) {
  switch (type) {
    case "icon":
      insertSentReaction(payload);
      break;

    case "reload":
      debouncedReload();
      break;

    case "vibecheck":
      displayVibeCheck();
      break;

    case "vibecheckresponse":
      recordVibeCheckResponse(payload);
      break;

    default:
      throw new Error("unknown type");
      break;
  }
}
