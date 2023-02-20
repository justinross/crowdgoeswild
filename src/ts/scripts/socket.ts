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

export async function sendReactionToSocket({icon, color, effect}) {
    emitSocketEvent({
        type: "icon",
        payload: {
            icon,
            color,
            effect
        }
    });
}


function handleSocketEvent({type, payload}) {
    switch (type) {
        case "icon":
            insertSentReaction(payload.icon, payload.color, payload.effect)
            break;

        default:
            throw new Error('unknown type')
            break;
    }

}
