import { saveAllReactionPNGs } from "./utils";
import { loadReactionsPreset, ReactionOption } from "./settings";
import { reactionSets } from "./reactionsets";
import { reloadAllClients } from "./socket";
import { ReactionEditor } from "./ReactionEditor";
import type { Reaction } from "./types";

const moduleId = "crowdgoeswild";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ReactionSetupMenu extends HandlebarsApplicationMixin(ApplicationV2) {
  loadedJSON: object = {};
  selectedPreset: string = "default";

  static override DEFAULT_OPTIONS = {
    id: "crowdgoeswild-reaction-setup",
    classes: ["crowdgoeswild", "reaction-setup"],
    tag: "div",
    window: {
      frame: true,
      positioned: true,
      title: "CrowdGoesWild - Reaction Setup",
      icon: "fas fa-icons",
      controls: [],
      resizable: true,
    },
    position: {
      width: 800,
      height: "auto" as const,
    },
    actions: {
      generatePNGs: ReactionSetupMenu.#onGeneratePNGs,
      loadPreset: ReactionSetupMenu.#onLoadPreset,
      editReaction: ReactionSetupMenu.#onEditReaction,
    },
  };

  static override PARTS = {
    form: {
      template: `modules/${moduleId}/templates/ReactionSetup.hbs`,
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      currentReactions: game.settings?.get(moduleId, "reactions") as [] ?? [],
      presets: reactionSets,
      selectedPreset: this.selectedPreset,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _onRender(context: object, options: any) {
    // Handle preset dropdown change
    const presetSelect = this.element.querySelector("#reactionPreset") as HTMLSelectElement;
    if (presetSelect) {
      presetSelect.addEventListener("change", (ev) => {
        this.selectedPreset = (ev.target as HTMLSelectElement).value;
      });
    }
  }

  // Action handlers - static methods that receive the app instance as `this`
  static async #onGeneratePNGs(this: ReactionSetupMenu, event: Event, target: HTMLElement) {
    event.preventDefault();
    this.close();
    await saveAllReactionPNGs(true);
    // reloadAllClients();
  }

  static async #onLoadPreset(this: ReactionSetupMenu, event: Event, target: HTMLElement) {
    event.preventDefault();
    event.stopPropagation();
    this.showLoadPresetDialog();
  }

  static async #onEditReaction(this: ReactionSetupMenu, event: Event, target: HTMLElement) {
    event.preventDefault();
    event.stopPropagation();
    const reactionId = target.dataset.id;
    if (reactionId) {
      const reactionEditor = new ReactionEditor(reactionId, this);
      reactionEditor.render(true);
    }
  }

  showImportReactionsDialog() {
    foundry.applications.api.DialogV2.prompt({
      window: { title: "Import Reactions" },
      content: `
        <p>Import a set of reactions from a JSON file? All current reactions will be overwritten.</p>
        <input type="file" id="importer" name="reactionjson" class="cgw importer">
      `,
      ok: {
        label: "Import",
        icon: "fas fa-check",
        callback: async () => {
          if (this.loadedJSON && Object.keys(this.loadedJSON).length > 0) {
            await this.saveReactionSetData(this.loadedJSON);
          }
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (event: Event, dialog: any) => {
        const importer = dialog.element.querySelector("#importer") as HTMLInputElement;
        if (importer) {
          importer.addEventListener("change", (ev) => {
            console.log("Loaded file");
            const reader = new FileReader();
            reader.onload = (readerEv) => {
              try {
                const loadedJSON = JSON.parse(readerEv.target?.result as string);
                if (this.validateLoadedJSON(loadedJSON)) {
                  this.loadedJSON = loadedJSON;
                }
              } catch (error) {
                console.log("Invalid JSON file");
                this.loadedJSON = {};
              }
            };
            const files = (ev.target as HTMLInputElement).files;
            if (files && files[0]) {
              reader.readAsText(files[0]);
            }
          });
        }
      },
    });
  }

  async exportReactions() {
    const data = await game.settings?.get(moduleId, "reactions");
    const dataJSON = JSON.stringify(data);
    foundry.utils.saveDataToFile(dataJSON, "text/json", "reactions.json");
  }

  async saveReactionSetData(data: object) {
    await game.settings?.set(moduleId, "reactions", data as Reaction[]);
    this.render();
  }

  validateLoadedJSON(data: unknown): boolean {
    let isValid = true;
    if (Array.isArray(data)) {
      if (data.length === 6) {
        for (const row of data) {
          for (const key in ReactionOption) {
            if (!(key in row)) {
              isValid = false;
              console.log(`Invalid JSON data in row ${row.id}: Missing ${key}`);
            }
          }
        }
      } else {
        isValid = false;
      }
    } else {
      isValid = false;
    }
    return isValid;
  }

  showLoadPresetDialog() {
    foundry.applications.api.DialogV2.confirm({
      window: { title: "Load Preset" },
      content: `<p>Load the ${reactionSets[this.selectedPreset].label} preset? Any changes you've made to reactions will be lost.</p>`,
      yes: {
        label: "Load Preset",
        icon: "fas fa-check",
        callback: async () => {
          await loadReactionsPreset(this.selectedPreset);
          this.render();
        },
      },
      no: {
        label: "Cancel",
        icon: "fas fa-times",
      },
    });
  }
}
