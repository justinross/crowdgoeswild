import registerSettings from "./settings";
import { id as moduleId } from "../../../public/module.json"
import {registerSocketEvents, sendReactionToSocket} from "./socket"
import { handleReactionClick } from "./events";
import { loadPartials } from "./handlebars";

export default function registerHooks() {
    Hooks.once('init', async function () {
        console.log("CrowdGoesWild Init")
        registerSocketEvents()
        registerSettings()
        loadPartials()
        // CONFIG.debug.hooks = true
    });

    Hooks.once('ready', async function () {
        exposeForMacros()
    });

    Hooks.on('renderSidebarTab', async (app, html, data) => {
        if (app.tabName !== 'chat') return;
        let $chatForm = $("#chat-form")
        let templatePath = `modules/${moduleId}/templates/parts/ReactionButtonBar.hbs`
        let templateData = {
            reactions: await game.settings.get(moduleId, 'reactions') as []
        }

        renderTemplate(templatePath, templateData).then(c =>{
            if(c.length > 0){
                let $content = $(c)
                $chatForm.after($content)
                $content.find('button').on('click', event => {
                    event.preventDefault()
                    let $self = $(event.currentTarget)
                    let dataset = event.currentTarget.dataset
                    let id = dataset.id
                    console.log("reaction clicked", id);
                    handleReactionClick(id)

                });

            }
        }).catch(e=>console.error(e))

    })

    // Hooks.on("getSceneControlButtons", controls => { 
    //     console.log(controls)
    //     controls = addButtons(controls)
    // });
}

function exposeForMacros() {
    game.modules.get(moduleId).api = {
        sendIcon({icon, color}) {
            sendReactionToSocket({icon, color})
        }
    }
}