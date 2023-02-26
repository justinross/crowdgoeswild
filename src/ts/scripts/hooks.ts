import { registerSettings,  resetDefaultReactions } from "./settings";
import { id as moduleId } from "../../../public/module.json"
import {registerSocketEvents, sendReactionToSocket} from "./socket"
import { handleReactionClick } from "./events";
import { loadPartials, registerHelpers } from "./handlebars";
import { randomNumber, getReactionObject, getReactionAsImage, getReactionHTML, getReactionPNGUrl, saveAllReactionPNGs } from "./utils";
import { ReactionSetupMenu } from "./ReactionSetupMenu";

export default function registerHooks() {
    Hooks.once('init', async function () {
        console.log("CrowdGoesWild Init")
        registerSocketEvents()
        registerSettings()
        loadPartials()
        registerHelpers()
        // CONFIG.debug.hooks = true
    });

    Hooks.once('ready', async function () {
        if(game.user.isGM){
            saveAllReactionPNGs()
        }
        exposeForMacros()
        // resetDefaultReactions()
        let rm = new ReactionSetupMenu({}).render(true)

    });

    Hooks.on('hotbarDrop', async function(bar, data, slot){
        if(data.type == "reaction"){
            let reactionId = data.id
            let droppedReaction = await getReactionObject(reactionId)
            // let reactions = await game.settings.get(moduleId, 'reactions') as []
            // let droppedReaction = reactions.find(r => r.id == args[1].id)
            let newMacro = await Macro.create({
                name: `Reaction - ${droppedReaction.title}`,
                type: "script",
                scope: "global",
                img: await getReactionPNGUrl(reactionId),
                command: `game.modules.get('crowdgoeswild').api.sendReaction(${reactionId})`,
            })
            game.user.assignHotbarMacro(newMacro, slot);
        }
    })


    Hooks.on('renderSidebarTab', async (app, html, data) => {
        console.log("Rendered sidebar tab");
        if (app.tabName !== 'chat') return;
        renderChatButtonBar()

        //Stress testing. Don't turn this on. Probably.
        // setTimeout(()=>{
        //     for (let index = 0; index < 1000; index++) {
        //         setTimeout(()=>sendReactionToSocket({icon: "heart", color: "#eb34b1", effect: "floatUp"}), randomNumber(0, 100))
        //     }
        // }, 4000)

    })

    // Hooks.on("getSceneControlButtons", controls => { 
    //     console.log(controls)
    //     controls = addButtons(controls)
    // });
}

export async function renderChatButtonBar(){
    let $chatForm = $("#chat-form")
    let $reactionBar = $('.cgw.reactionbar')
    $reactionBar.remove()
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
                handleReactionClick(id)

            });
            $content.find('button').on('dragstart', event => {
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({id: event.currentTarget.dataset.id, type: "reaction"}));
            })

        }
    }).catch(e=>console.error(e))
}

function exposeForMacros() {
    game.modules.get(moduleId).api = {
        sendReaction(reactionId) {
            sendReactionToSocket(reactionId)
        }
    }
}