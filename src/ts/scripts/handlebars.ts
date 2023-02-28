import { id as moduleId } from "../../../public/module.json";
import { getReactionHTML } from "./utils";

export async function registerHelpers() {
  Handlebars.registerHelper("reactionPreview", (reaction) => {
    let html = getReactionHTML(reaction);
    return new Handlebars.SafeString(html);
  });

  Handlebars.registerHelper("last_x", (array, count) => {
    array = array.slice(-count);
    return array;
  });
}

export function loadPartials() {
  let partialsList = [
    `modules/${moduleId}/templates/parts/ReactionRow.hbs`,
    `modules/${moduleId}/templates/parts/ReactionButtonBar.hbs`,
  ];
  loadTemplates(partialsList);
}
