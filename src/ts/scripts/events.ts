import {gsap, CustomWiggle, CustomEase} from "/scripts/greensock/esm/all.js"
import { randomNumber, getReactionObject, getReactionHTML } from "./utils";
import { sendReactionToSocket } from "./socket";
import { id as moduleId } from "../../../public/module.json"

export async function insertSentReaction(reactionId) {
    let reaction = await getReactionObject(reactionId)

    let htmlString = await getReactionHTML(reaction)
    let $fullScreen = $("#interface");

    let $added = $(htmlString).appendTo($fullScreen)
    gsap.effects[reaction.effect]($added, {parent: $fullScreen, reaction: reaction})
}



export async function handleReactionClick(id){
    // let clickedReaction = reactions.find(r => r.id == id)
    sendReactionToSocket(id)
}