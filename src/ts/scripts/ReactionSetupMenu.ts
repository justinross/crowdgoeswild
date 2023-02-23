import { id as moduleId } from "../../../public/module.json"
import { saveAllReactionPNGs } from "./utils";
const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 500);

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
            width: 900,
            height: 600,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }

    async getData() {
        let currentReactions = game.settings.get(moduleId, 'reactions') as []
        // let outputReactions = []
        // for (const reaction of currentReactions) {
        //     if(!reaction.id){

        //     }
        // }
        return  currentReactions
    }

    async _updateObject(event, formData) {
        const data = expandObject(formData)
        let reactions = []

        for (const reaction of Object.values(data)) {
            reactions[reaction.id] = reaction
        }
        await game.settings.set(moduleId, 'reactions', reactions)
        this.render();
    }

    activateListeners(html) {
        super.activateListeners(html)
        html.find("#generateButton").on("click", async (ev)=>{
            this.close()
            ui.notifications.info(`Generating icons for reaction macros. This will take a moment.`, {permanent: false});
            await saveAllReactionPNGs(true)
            debouncedReload()
        })
    }


    
}

