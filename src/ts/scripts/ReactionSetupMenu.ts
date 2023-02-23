import { id as moduleId } from "../../../public/module.json"
import { debouncedReload, saveAllReactionPNGs } from "./utils";
import { resetDefaultReactions } from "./settings";

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
            await saveAllReactionPNGs(true)
            debouncedReload()
        })
        html.find("#resetButton").on("click", (ev)=>{
            this.showResetDefaultsDialog()
        })
    }

    showResetDefaultsDialog(){
        let d = new Dialog({
            title: "Restore Defaults",
            content: "<p>Reset the reaction set to defaults? All changes will be lost.</p>",
            buttons: {
             one: {
              icon: '<i class="fas fa-check"></i>',
              label: "Reset Defaults",
              callback: () => resetDefaultReactions()
             },
             two: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel",
              callback: () => this.close()
             }
            },
            default: "two",
            render: html => {},
            close: html => {}
           });
        d.render(true);
    }




    
}

