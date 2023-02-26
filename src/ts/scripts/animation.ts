import {
  gsap,
  CustomWiggle,
  CustomEase,
  Physics2DPlugin,
  Elastic,
} from "/scripts/greensock/esm/all.js";
import { randomNumber, calcAngleDegrees, invlerp, lerp } from "./utils";

export function animationInit() {
  gsap.registerPlugin(CustomEase, CustomWiggle, Physics2DPlugin);
  CustomWiggle.create("wiggle", {
    wiggles: 5,
    type: "uniform",
    duration: 10,
  });

  CustomWiggle.create("shake", {
    wiggles: 8,
    type: "easeOut",
    duration: 1,
  });

  CustomWiggle.create("flutter", {
    wiggles: 6,
    type: "uniform",
    duration: 30,
  });

  registerEffects();
}

function registerEffects() {
  let defaults = {
    edgePaddingPercentage: 20,
    offscreen: -50,
  };

  gsap.registerEffect({
    name: "fadeAndRemove",
    effect: (targets, config) => {
      let tl = gsap.timeline();
      tl.to(targets, {
        duration: config.duration,
        opacity: 0,
      }).call(() => {
        $(targets).remove();
      });
      return tl;
    },
    defaults: { duration: 2 },
    extendTimeline: true,
  });

  gsap.registerEffect({
    name: "physics-floatUp",
    effect: (targets, config) => {
      let tl = gsap.timeline({
        defaults: {
          duration: 5,
        },
      });

      let $fullScreen = config.parent;

      let edgePaddingPixels =
        $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);

      let yEnd = $fullScreen.height();

      gsap.set(targets, {
        left: xFrom,
        bottom: defaults.offscreen,
      });

      let randomLife = randomNumber(1, 5);

      tl.to(
        targets,
        {
          x: randomNumber(-40, 40),
          scale: randomNumber(0.95, 1.25),
          rotation: randomNumber(-10, 10),
          duration: 10,
          ease: "wiggle",
        },
        0
      );
      tl.to(
        targets,
        {
          duration: 30,
          physics2D: {
            velocity: 200,
            angle: "random(250, 290)",
            // angle: ,
            gravity: -100,
          },
        },
        0
      ).fadeAndRemove(targets, {}, randomLife);
      return tl;
    },
  });

  gsap.registerEffect({
    name: "floatUp",
    effect: (targets, config) => {
      let tl = gsap.timeline({
        defaults: {
          duration: 5,
        },
      });

      let $fullScreen = config.parent;

      let edgePaddingPixels =
        $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);

      let yEnd = $fullScreen.height();

      gsap.set(targets, {
        left: xFrom,
        bottom: defaults.offscreen,
      });

      let randomLife = randomNumber(1, 5);

      tl.to(
        targets,
        {
          x: randomNumber(-40, 40),
          scale: randomNumber(0.95, 1.25),
          rotation: randomNumber(-10, 10),
          duration: 10,
          ease: "wiggle",
        },
        0
      )
        .to(
          targets,
          {
            y: yEnd * -1,
            ease: "easeOut",
            duration: 8,
          },
          0
        )
        .fadeAndRemove(targets, {}, randomLife);
      return tl;
    },
  });

  gsap.registerEffect({
    name: "drop",
    effect: (targets, config) => {
      let tl = gsap.timeline({
        defaults: {
          duration: 5,
        },
      });

      let $fullScreen = config.parent;

      let edgePaddingPixels =
        $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);

      gsap.set(targets, {
        left: xFrom,
        top: defaults.offscreen * -1,
      });

      tl.to(
        targets,
        {
          top: $fullScreen.height() + defaults.offscreen * -1,
          ease: "none",
          duration: 1,
        },
        0
      ).fadeAndRemove(targets);

      return tl;
    },
  });

  gsap.registerEffect({
    name: "physics-drop",
    effect: (targets, config) => {
      let tl = gsap.timeline({
        defaults: {
          duration: 5,
        },
      });

      let $fullScreen = config.parent;

      let edgePaddingPixels =
        $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);

      gsap.set(targets, {
        left: xFrom,
        top: defaults.offscreen,
      });

      tl.to(
        targets,
        {
          duration: 30,
          physics2D: {
            velocity: 0,
            // velocity: 600,
            // angle: "random(250, 290)",
            angle: 0,
            gravity: 500,
          },
        },
        0
      ).fadeAndRemove(targets);

      return tl;
    },
  });

  gsap.registerEffect({
    name: "physics-flutterDown",
    effect: (targets, config) => {
      let tl = gsap.timeline();

      let $fullScreen = config.parent;

      let edgePaddingPixels =
        $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);

      //wtf
      tl.fromTo(
        targets,
        {
          left: xFrom,
          // top: 300,
          top: defaults.offscreen,
          transformOrigin: "0 -500px",
          rotation: "random(0, 20)",
          scaleX: "random([-1, 1])",
        },
        {
          rotation: "random([-60, -30, 30, 60])",
          ease: "flutter",
          duration: 30,
        },
        0
      );

      tl.to(
        targets,
        {
          duration: 30,
          top: $fullScreen.height() + 100,
          // physics2D: {
          //   velocity: 0,
          //   angle: 0,
          //   gravity: 50,
          // },
        },
        0
      ).fadeAndRemove(targets);
    },
  });
  gsap.registerEffect({
    name: "physics-toss",
    effect: (targets, config) => {
      let tl = gsap.timeline();

      let $fullScreen = config.parent;

      let edgePaddingPixels =
        $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);

      let center = { x: $fullScreen.width() / 2, y: $fullScreen.height() / 2 };
      let angleToCenter =
        calcAngleDegrees(xFrom - center.x, $fullScreen.height()) + 180;
      // let directionRatio = lerp(-1, 1, invlerp(180, 360, angleToCenter))
      let directionRatio = gsap.utils.mapRange(180, 360, -1, 1, angleToCenter);
      directionRatio = directionRatio > 0 ? 1 : -1;
      let gravity = 600;
      let velocityBase = $fullScreen.height() * 0.6 + 320;
      let velocity = randomNumber(velocityBase * 0.85, velocityBase * 1.15);

      gsap.set(targets, {
        left: xFrom,
        bottom: defaults.offscreen,
      });

      if (config.reaction.directional) {
        gsap.set(targets, {
          scaleX: directionRatio,
        });
      }

      tl.to(
        targets,
        {
          rotation: 360 * directionRatio,
          duration: 1,
          repeat: -1,
          ease: "none",
        },
        0
      )
        .to(
          targets,
          {
            duration: 30,
            physics2D: {
              velocity: velocity,
              // velocity: 600,
              // angle: "random(250, 290)",
              angle: angleToCenter + randomNumber(-10, 10),
              gravity: gravity,
            },
          },
          0
        )
        .fadeAndRemove(targets);

      return tl;
    },
  });

  gsap.registerEffect({
    name: "shutdown",
    effect: (targets, config) => {
      let tl = gsap.timeline();

      let $fullScreen = config.parent;

      let $modalBG = $('<div class="cgw modal"></div>').appendTo($fullScreen);
      gsap.set($modalBG, {
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: config.reaction.secondaryColor,
        backdropFilter: "blur(5px)",
        position: "absolute",
        zIndex: 1000,
      });

      gsap.set(targets, {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        fontSize: "50vh",
      });

      game.togglePause(true);
      tl.to(targets, {
        rotation: 5,
        // duration: 10,
        // repeat: -1,
        ease: "shake",
      })
        .fadeAndRemove(targets, { duration: 1 }, 4)
        .fadeAndRemove($modalBG, { duration: 1 }, 4);

      return tl;
    },
  });
}
