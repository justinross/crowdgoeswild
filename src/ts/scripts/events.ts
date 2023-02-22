import {gsap, CustomWiggle, CustomEase} from "/scripts/greensock/esm/all.js"
import { randomNumber } from "./utils";
import { sendReactionToSocket } from "./socket";
import { id as moduleId } from "../../../public/module.json"

export async function insertSentReaction(reactionId) {
    let reactions = await game.settings.get(moduleId, 'reactions') as []
    let reaction = reactions.find(r => r.id == reactionId)

    let $fullScreen = $("#interface");

    let htmlString = `
        <i class="${reaction.style} fa-${reaction.icon} cgw-reaction" 
            style="
                color: ${reaction.primaryColor}; 
                --fa-primary-color: ${reaction.primaryColor};
                --fa-secondary-color: ${reaction.secondaryColor};
                --fa-secondary-opacity: 1;
                position: absolute; 
                z-index: 100000;
                font-size: 4rem;" />`
            // bottom: ${yStart}px;
            // left: ${ randomNumber(xStart, xEnd) }px;
    let $added = $(htmlString).appendTo($fullScreen)
    gsap.effects[reaction.effect]($added, {parent: $fullScreen, reaction: reaction})
}

export async function handleReactionClick(id){
    // let clickedReaction = reactions.find(r => r.id == id)
    sendReactionToSocket(id)
}