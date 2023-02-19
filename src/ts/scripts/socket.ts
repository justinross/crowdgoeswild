import {insertReaction} from "./events";
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

export async function sendReaction({icon, color}) {
    emitSocketEvent({
        type: "icon",
        payload: {
            icon,
            color
        }
    });
}

export async function handleReactionClick(id){
    let reactions = await game.settings.get(moduleId, 'reactions') as []
    let clickedReaction = reactions.find(r => r.id == id)
    sendReaction({icon: clickedReaction.icon, color: clickedReaction.color})
}

function handleSocketEvent({type, payload}) {
    switch (type) {
        case "icon":
            insertReaction(payload.icon, payload.color)
            break;

        default:
            throw new Error('unknown type')
            break;
    }

}
