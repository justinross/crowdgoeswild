import {gsap, CustomWiggle, CustomEase} from "/scripts/greensock/esm/all.js"
import { randomNumber } from "./utils"

export function animationInit(){
    gsap.registerPlugin(CustomEase, CustomWiggle)
    CustomWiggle.create("wiggle", {
        wiggles: 5,
        type: "uniform",
        duration: 10
    });
    registerEffects()
}

function registerEffects(){
    gsap.registerEffect({
        name: "floatUp",
        effect: (targets, config) => {
            let tl = gsap.timeline({
                defaults: {
                    duration: 5
                }
            })

            let $fullScreen = config.parent

            let edgePaddingPercentage = 20;
            let edgePaddingPixels = $fullScreen.width() * (edgePaddingPercentage / 100);
            let xStart = edgePaddingPixels;
            let xEnd = $fullScreen.width() - edgePaddingPixels;
            let xFrom = randomNumber(xStart, xEnd);

            let yStart = "-50";
            let yEnd = $fullScreen.height() * .66 + randomNumber(-200, 200);

            gsap.set(targets, {
                left: xFrom,
                bottom: yStart
            })


            tl.to(targets, {
                x: 30,
                duration: 10,
                ease: "wiggle"
            }, 0)

            tl.to(targets, {
                y: yEnd * -1,
                ease: "easeOut",
                duration: 8
            }, 0)

            tl.to(targets, {
                opacity: 0,
                duration: 1
            }, "3")
            return tl
        },
    })

    gsap.registerEffect({
        name: "drop",
        effect: (targets, config) => {
            let tl = gsap.timeline({
                defaults: {
                    duration: 5
                }
            })

            let $fullScreen = config.parent

            let edgePaddingPercentage = 20;
            let edgePaddingPixels = $fullScreen.width() * (edgePaddingPercentage / 100);
            let xStart = edgePaddingPixels;
            let xEnd = $fullScreen.width() - edgePaddingPixels;
            let xFrom = randomNumber(xStart, xEnd);

            let offscreen = 50;

            gsap.set(targets, {
                left: xFrom,
                top: offscreen * -1
            })

            tl.to(targets, {
                top: $fullScreen.height() + offscreen,
                ease: "none",
                duration: 1
            }, 0)

            return tl
        },
    })
}
