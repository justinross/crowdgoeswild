import {insertIcon} from "./events";

export function registerSocketEvents() {
    game.socket.on('module.crowdgoeswild', handleSocketEvent)
}

export async function emitSocketEvent({type, payload}) {
    let event = {
        type,
        payload
    }
    await game.socket.emit('module.crowdgoeswild', event);
    handleSocketEvent(event)
}

function handleSocketEvent({type, payload}) {
    switch (type) {
        case "1":
            insertIcon("heart", "#eb34b1")
            break;

        default:
            throw new Error('unknown type')
            break;
    }

}
