import {gsap, CustomWiggle, CustomEase} from "/scripts/greensock/esm/all.js"
import { randomNumber } from "./utils";
import { sendReactionToSocket } from "./socket";
import { id as moduleId } from "../../../public/module.json"

export function insertSentReaction(icon, color) {
    let $fullScreen = $("#interface");
    let edgePaddingPercentage = 20;
    let edgePaddingPixels = $fullScreen.width() * (edgePaddingPercentage / 100);
    let xStart = edgePaddingPixels;
    let xEnd = $fullScreen.width() - edgePaddingPixels;
    let yStart = "-50";
    let yEnd = $fullScreen.height() * .66 + randomNumber(-200, 200);
    let htmlString = `
        <i class="fas fa-${icon} cgw-reaction" 
            style="
            color: ${color}; 
            position: absolute; 
            bottom: ${yStart}px;
            z-index: 100000;
            left: ${ randomNumber(xStart, xEnd) }px;
            font-size: 4rem;" />`
    let $added = $(htmlString).appendTo($fullScreen)
    let tl = gsap.timeline({
        defaults: {
            duration: 5
        }
    })
    gsap.registerPlugin(CustomEase, CustomWiggle)

    CustomWiggle.create("Wiggle.easeOut", {
        wiggles: 5,
        type: "easeOut",
        duration: 10
    });
    tl.to($added, {
        x: 30,
        duration: 10,
        ease: "Wiggle.easeOut"
    }, 0)
    tl.to($added, {
        y: yEnd * -1,
        ease: "easeOut",
        duration: 8
    }, 0)
    tl.to($added, {
        opacity: 0,
        duration: 1
    }, "3")
}

export async function handleReactionClick(id){
    let reactions = await game.settings.get(moduleId, 'reactions') as []
    let clickedReaction = reactions.find(r => r.id == id)
    sendReactionToSocket({icon: clickedReaction.icon, color: clickedReaction.color})
}