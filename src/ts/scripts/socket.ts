import {insertSentReaction} from "./events";
import { id as moduleId } from "../../../public/module.json"

export function registerSocketEvents() {
    game.socket.on(`module.${moduleId}`, handleSocketEvent)
}

export async function emitSocketEvent({type, payload}) {
    let event = {
        type,
        payload
    }
    await game.socket.emit(`module.${moduleId}`, event);
    handleSocketEvent(event)
}

export async function sendReactionToSocket(reactionId) {
    emitSocketEvent({
        type: "icon",
        payload: reactionId
    });
}


function handleSocketEvent({type, payload}) {
    switch (type) {
        case "icon":
            insertSentReaction(payload)
            break;

        default:
            throw new Error('unknown type')
            break;
    }

}
