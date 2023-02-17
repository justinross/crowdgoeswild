import {registerSocketEvents, emitSocketEvent} from "./socket"

export default function registerHooks() {

    Hooks.once('init', async function () {
        console.log("CrowdGoesWild Init")
    });

    Hooks.once('ready', async function () {
        registerSocketEvents()
    });

    Hooks.on("getSceneControlButtons", controls => { // Add a scene control under the tokens menu if GM
        console.log("Get scene control buttons");
        controls.find(c => c.name == "token").tools.push({
            name: "groups", title: "Button", icon: "fas fa-heart",
            // toggle: true,
            // active: Ctg.selectGroups ?? false,
            onClick: () => emitSocketEvent(
                {type: "1", payload: "Nothing"}
            )
        });
    });
}
