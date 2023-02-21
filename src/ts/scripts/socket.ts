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

export async function sendReactionToSocket(reaction) {

    emitSocketEvent({
        type: "icon",
        payload: {
            icon : reaction.icon,
            primaryColor: reaction.primaryColor,
            secondaryColor: reaction.secondaryColor,
            effect: reaction.effect,
            directional: reaction.directional,
            style: reaction.style

        }
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
