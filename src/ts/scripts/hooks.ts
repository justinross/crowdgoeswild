import registerSettings from "./settings";
import { id as moduleId } from "../../../public/module.json"
import {registerSocketEvents, sendReaction} from "./socket"
import { loadPartials } from "../../handlebarsHelpers";

export default function registerHooks() {
    Hooks.once('init', async function () {
        console.log("CrowdGoesWild Init")
        registerSocketEvents()
        registerSettings()
        loadPartials()
    });

    Hooks.once('ready', async function () {
        exposeForMacros()
    });

    Hooks.on("getSceneControlButtons", controls => { // Add a scene control under the tokens menu if GM
        console.log("Get scene control buttons");
        controls.find(c => c.name == "token").tools.push({
            name: "groups", title: "Button", icon: "fas fa-heart",
            // toggle: true,
            // active: Ctg.selectGroups ?? false,
            onClick: () => sendReaction(
                {icon: "heart", color: "#eb34b1"}
            )
        });
    });
}

function exposeForMacros() {
    game.modules.get(moduleId).api = {
        sendIcon(
            {icon, color}
        ) {
            sendReaction({icon, color})
        }
    }
}
