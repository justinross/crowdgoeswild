import { getReactionHTML } from "./utils";

const moduleId = "crowdgoeswild";

export async function registerHelpers() {
  Handlebars.registerHelper("reactionPreview", (reaction) => {
    let html = getReactionHTML(reaction);
    return new Handlebars.SafeString(html);
  });

  Handlebars.registerHelper("last_x", (array, count) => {
    array = array.slice(-count);
    return array;
  });

  Handlebars.registerHelper("add", (input, add) => {
    return parseInt(input) + parseInt(add);
  });

  Handlebars.registerHelper("eq", (arg1, arg2) => {
    return arg1 == arg2;
  });
}

export function loadPartials() {
  let partialsList = [
    `modules/${moduleId}/templates/parts/ReactionRow.hbs`,
    `modules/${moduleId}/templates/parts/ReactionButtonBar.hbs`,
  ];
  foundry.applications.handlebars.loadTemplates(partialsList);
}
