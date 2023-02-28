import { gsap, CustomWiggle, CustomEase } from "/scripts/greensock/esm/all.js";
import { randomNumber, getReactionObject, getReactionHTML } from "./utils";
import { sendReactionToSocket } from "./socket";
import { id as moduleId } from "../../../public/module.json";
import VibeCheckPopup from "./VibeCheckPopup";

export async function insertSentReaction(reactionId) {
  let reaction = await getReactionObject(reactionId);

  let htmlString = await getReactionHTML(reaction);
  let $fullScreen = $("#interface");

  let $added = $(htmlString).appendTo($fullScreen);
  gsap.effects[reaction.effect]($added, {
    parent: $fullScreen,
    reaction: reaction,
  });
}

export async function displayVibeCheck(duration) {
  let vc = VibeCheckPopup.getInstance();
  vc.userResponses = [];
  vc.render(true);
  if (duration > 0) {
    if (!game.user.isGM) {
      setTimeout(() => vc.close(), duration * 1000);
    } else {
      setTimeout(() => vc.close(), duration * 2 * 1000);
    }
  }
}

export async function handleReactionClick(id) {
  // let clickedReaction = reactions.find(r => r.id == id)
  sendReactionToSocket(id);
}
