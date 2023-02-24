import { id as moduleId } from "../../../public/module.json"
import { debouncedReload, saveAllReactionPNGs } from "./utils";
import { resetDefaultReactions, ReactionOption } from "./settings";
import { renderChatButtonBar } from "./hooks";

export class ReactionSetupMenu extends FormApplication {
    // constructor(exampleOption) {
    //     super(exampleOption);
    // }

    loadedJSON = {}

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form', 'crowdgoeswild', 'reactionSetup'],
            popOut: true,
            template: `modules/${moduleId}/templates/ReactionSetup.hbs`,
            id: `${moduleId}-reaction-setup`,
            title: 'CrowdGoesWild - Reaction Setup',
            width: 900,
            submitOnChange: true,
            closeOnSubmit: false,
            resizable: true
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
        this.render()
        renderChatButtonBar()
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
        html.find("#exportButton").on("click", (ev)=>{
            this.exportReactions()
        })
        html.find("#importButton").on("click", (ev)=>{
            this.showImportReactionsDialog()
        })
    }

    showImportReactionsDialog(){
        let d = new Dialog({
            title: "Import Reactions",
            content: `
            <p>Import a set of reactions from a JSON file? All current reactions will be overwritten.</p>
            <input type="file" id="importer" name="reactionjson" class="cgw importer">
            `,
            buttons: {
             one: {
              icon: '<i class="fas fa-check"></i>',
              label: "Import",
              callback: () => {
                if(this.loadedJSON){
                    this.saveReactionSetData(this.loadedJSON)
                }
              }
             },
             two: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel",
              callback: () => {}
             }
            },
            default: "two",
            render: html => {
                $(html).find("#importer").on("change", (ev)=>{
                    console.log("Loaded file");
                    let reader = new FileReader()
                    reader.onload = (readerEv)=>{
                        try {
                            let loadedJSON = JSON.parse(readerEv.target.result);
                            if(this.validateLoadedJSON(loadedJSON)){
                                this.loadedJSON = loadedJSON
                            }
                        } catch (error) {
                            console.log("Invalid JSON file")
                            this.loadedJSON = false
                        }
                        console.log(this.loadedJSON);
                    }
                    reader.readAsText(ev.target.files[0]);
                })
            },
            close: html => {}
           });
        d.render(true);

    }

    async exportReactions(){
        let data = await game.settings.get(moduleId, 'reactions')
        let dataJSON = JSON.stringify(data)
        saveDataToFile(dataJSON, 'text/json', 'reactions.json')
    }

    async saveReactionSetData(data){
        // await game.settings.set(moduleId, 'reactions', data)
    }

    validateLoadedJSON(data){
        let isValid = true
        // make sure it's an array
        if(Array.isArray(data)){
            // make sure nobody's slipping in the wrong number of reactions
            if(data.length == 6){
                // check each row to make sure it has the right fields
                for (const row of data) {
                    for (const key in ReactionOption) {
                        if(!(key in row)){
                            isValid = false
                            console.log(`Invalid JSON data in row ${row.id}: Missing ${key}`)
                        }
                    }
                }
            }
            else{
                isValid = false
            }
        }
        return isValid
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

