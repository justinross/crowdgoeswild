import { id as moduleId } from "../public/module.json"
export function registerHelpers(){
}

export function loadPartials(){
    let partialsList = [
        `modules/${moduleId}/templates/parts/ReactionRow.hbs`
    ]
    loadTemplates(partialsList);
}

