import {gsap, CustomWiggle, CustomEase} from "/scripts/greensock/esm/all.js"
import { randomNumber } from "./utils";
import { sendReactionToSocket } from "./socket";
import { id as moduleId } from "../../../public/module.json"

export function insertSentReaction(reaction) {

    let $fullScreen = $("#interface");
    let htmlString = `
        <i class="fas fa-${reaction.icon} cgw-reaction" 
            style="
            color: ${reaction.color}; 
            position: absolute; 
            z-index: 100000;
            font-size: 4rem;" />`
            // bottom: ${yStart}px;
            // left: ${ randomNumber(xStart, xEnd) }px;
    let $added = $(htmlString).appendTo($fullScreen)
    gsap.effects[reaction.effect]($added, {parent: $fullScreen, directional: reaction.directional})
}

export async function handleReactionClick(id){
    let reactions = await game.settings.get(moduleId, 'reactions') as []
    let clickedReaction = reactions.find(r => r.id == id)
    sendReactionToSocket(clickedReaction)
}