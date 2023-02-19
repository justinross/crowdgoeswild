import { id as moduleId } from "../../../public/module.json"
export class ReactionSetupMenu extends FormApplication {
    // constructor(exampleOption) {
    //     super(exampleOption);
    // }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            template: `modules/${moduleId}/templates/ReactionSetup.hbs`,
            id: `${moduleId}-reaction-setup`,
            title: 'CrowdGoesWild - Reaction Setup',
            width: 600,
            height: 600
        });
    }

    async getData() {
        let currentReactions = game.settings.get(moduleId, 'reactions') as [];
        // let outputReactions = []
        // for (const reaction of currentReactions) {
        //     if(!reaction.id){

        //     }
        // }
        return  currentReactions
    }

    async _updateObject(event, formData) {
        const data = expandObject(formData);
        game.settings.set(moduleId, 'reactions', data);
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
