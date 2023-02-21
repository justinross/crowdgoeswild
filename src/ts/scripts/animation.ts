import {gsap, CustomWiggle, CustomEase, Physics2DPlugin} from "/scripts/greensock/esm/all.js"
import { randomNumber, calcAngleDegrees, invlerp, lerp } from "./utils"

export function animationInit(){
    gsap.registerPlugin(CustomEase, CustomWiggle, Physics2DPlugin)
    CustomWiggle.create("wiggle", {
        wiggles: 5,
        type: "uniform",
        duration: 10
    });
    registerEffects()
}


function registerEffects(){
    let defaults = {
        edgePaddingPercentage : 20,
        offscreen : -50
    }

    gsap.registerEffect({
        name: "floatUp",
        effect: (targets, config) => {
            let tl = gsap.timeline({
                defaults: {
                    duration: 5
                }
            })

            let $fullScreen = config.parent

            let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
            let xStart = edgePaddingPixels;
            let xEnd = $fullScreen.width() - edgePaddingPixels;
            let xFrom = randomNumber(xStart, xEnd);

            let yEnd = $fullScreen.height() * .66 + randomNumber(-200, 200);

            gsap.set(targets, {
                left: xFrom,
                bottom: defaults.offscreen,
            })


            tl.to(targets, {
                x: randomNumber(-40, 40),
                rotation: randomNumber(-10, 10),
                duration: 10,
                ease: "wiggle"
            }, 0)
            .to(targets, {
                y: yEnd * -1,
                ease: "easeOut",
                duration: 8
            }, 0)
            .to(targets, {
                opacity: 0,
                duration: 1
            }, "3")
            .call(()=>$(targets).remove())
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

            let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
            let xStart = edgePaddingPixels;
            let xEnd = $fullScreen.width() - edgePaddingPixels;
            let xFrom = randomNumber(xStart, xEnd);

            gsap.set(targets, {
                left: xFrom,
                top: defaults.offscreen * -1
            })

            tl.to(targets, {
                top: $fullScreen.height() + defaults.offscreen * -1,
                ease: "none",
                duration: 1
            }, 0)
            .call(()=>$(targets).remove())

            return tl
        },
    })

    gsap.registerEffect({
        name: "physics-toss",
        effect: (targets, config) =>{
            let tl = gsap.timeline()

            let $fullScreen = config.parent

            let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
            let xStart = edgePaddingPixels;
            let xEnd = $fullScreen.width() - edgePaddingPixels;
            let xFrom = randomNumber(xStart, xEnd);

            let center = {x: $fullScreen.width() / 2, y: $fullScreen.height() / 2}
            let angleToCenter = calcAngleDegrees(xFrom - center.x, $fullScreen.height()) + 180
            // let directionRatio = lerp(-1, 1, invlerp(180, 360, angleToCenter))
            let directionRatio = gsap.utils.mapRange(180, 360, -1, 1, angleToCenter)
            directionRatio = directionRatio > 0 ? 1 : -1

            gsap.set(targets, {
                left: xFrom,
                bottom: defaults.offscreen,
            })

            if(config.directional){
                gsap.set(targets, {
                    scaleX: directionRatio
                })
            }
            
            tl
            .to(targets, {
                rotation: 360 * directionRatio,
                duration: 1,
                repeat: -1,
                ease:"none"
            }, 0)
            .to(targets, {
                duration: 30,
                physics2D: {
                    velocity: randomNumber(($fullScreen.height() / 1.5) * 0.85, ($fullScreen.height() / 1.5) * 1.15),
                    // velocity: 600,
                    // angle: "random(250, 290)",
                    angle: angleToCenter + randomNumber(-10, 10),
                    gravity: 500
                }
            }, 0)
            .call(()=>$(targets).remove())

            return tl
        }
    })
}
