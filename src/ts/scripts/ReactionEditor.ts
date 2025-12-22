import type { Reaction } from "./types";
import type { ReactionSetupMenu } from "./ReactionSetupMenu";

const moduleId = "crowdgoeswild";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ReactionEditor extends HandlebarsApplicationMixin(ApplicationV2) {
  reactionId: string;
  parent: ReactionSetupMenu | undefined;

  constructor(reactionId: string, parent?: ReactionSetupMenu) {
    super({});
    this.reactionId = reactionId;
    this.parent = parent;
  }

  static override DEFAULT_OPTIONS = {
    id: "crowdgoeswild-reaction-editor",
    classes: ["crowdgoeswild", "reaction-editor"],
    tag: "form",
    window: {
      frame: true,
      positioned: true,
      title: "CrowdGoesWild - Reaction Editor",
      icon: "fas fa-edit",
      controls: [],
      resizable: true,
    },
    position: {
      width: 600,
      height: "auto" as const,
    },
    form: {
      handler: ReactionEditor.#onFormSubmit,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      switchColors: ReactionEditor.#onSwitchColors,
    },
  };

  static override PARTS = {
    form: {
      template: `modules/${moduleId}/templates/ReactionEditor.hbs`,
    },
  };

  async getThisReaction(): Promise<Reaction | undefined> {
    const reactions = (await game.settings?.get(moduleId, "reactions")) as Reaction[] ?? [];
    const data = reactions.find((reaction) => reaction.id == this.reactionId);
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    const data = await this.getThisReaction();
    
    if (!data) {
      return context;
    }

    return {
      ...context,
      ...data,
      meta: {
        typeOptions: {
          fontawesome: "Font Icon",
          filepicker: "Image/Video",
        },
        effectOptions: {
          "physics-floatUp": "Float Up",
          "physics-drop": "Fall Down",
          "physics-flutterDown": "Flutter Down",
          "physics-toss": "Throw",
          shutdown: "Shutdown",
        },
        styleOptions: {
          fas: "Solid",
          "fa-duotone": "Duotone",
          "fa-regular": "Regular",
          "fa-light": "Light",
          "fa-thin": "Thin",
        },
      },
    };
  }

  static async #onFormSubmit(
    this: ReactionEditor,
    event: Event | SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    const data = formData.object;
    const reactions = (await game.settings?.get(moduleId, "reactions")) as Reaction[] ?? [];
    const index = reactions.findIndex((reaction) => reaction.id == this.reactionId);
    
    if (index !== -1) {
      reactions[index] = data as unknown as Reaction;
      await game.settings?.set(moduleId, "reactions", reactions);
      this.render();
      this.parent?.render();
    }
  }

  switchColors(inputEl1: HTMLInputElement, inputEl2: HTMLInputElement) {
    const v1 = inputEl1.value;
    const v2 = inputEl2.value;
    inputEl2.value = v1;
    inputEl1.value = v2;
  }

  static async #onSwitchColors(this: ReactionEditor, event: Event, target: HTMLElement) {
    event.preventDefault();
    event.stopPropagation();
    
    const colorsContainer = target.closest(".colors");
    if (!colorsContainer) return;
    
    const primaryPicker = colorsContainer.querySelector(".primaryColor color-picker") as HTMLInputElement;
    const secondaryPicker = colorsContainer.querySelector(".secondaryColor color-picker") as HTMLInputElement;
    
    if (primaryPicker && secondaryPicker) {
      this.switchColors(primaryPicker, secondaryPicker);
    }
  }
}
