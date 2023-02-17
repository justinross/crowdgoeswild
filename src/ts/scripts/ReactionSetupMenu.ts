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
        return game.settings.get(moduleId, 'reactions');
    }

    async _updateObject(event, formData) {
        const data = expandObject(formData);
        game.settings.set(moduleId, 'reactions', data);
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
