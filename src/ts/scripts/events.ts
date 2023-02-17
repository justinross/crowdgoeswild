import {gsap, CustomWiggle, CustomEase} from "/scripts/greensock/esm/all.js"

export function insertReaction(icon, color) {
    let $fullScreen = $("#interface");
    let edgePaddingPercentage = 10;
    let edgePaddingPixels = $fullScreen.width() * (1 / edgePaddingPercentage);
    let xStart = edgePaddingPixels;
    let xEnd = $fullScreen.width() - edgePaddingPixels;
    let yStart = "-50";
    let yEnd = $fullScreen.height() * .66;
    let htmlString = `
        <i class="fas fa-${icon}" 
            style="
            color: ${color}; 
            position: absolute; 
            bottom: ${yStart}px;
            z-index: 100000;
            left: ${
        Math.floor(Math.random() * (xEnd - xStart + 1)) + xStart
    }px;
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
    tl.to($added, 3, {
        opacity: 0,
        duration: .5
    }, "4")
}
