import { sendVibeCheckResponse } from "./socket";
import { getReactionObject } from "./utils";
import type { Reaction } from "./types";

const moduleId = "crowdgoeswild";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type UserResponse = {
  user: User;
  response: Reaction;
};

export default class VibeCheckPopup extends HandlebarsApplicationMixin(ApplicationV2) {
  static instance: VibeCheckPopup | null = null;
  userResponses: UserResponse[] = [];
  private keyupHandler: ((ev: KeyboardEvent) => void) | null = null;

  static getInstance(): VibeCheckPopup {
    if (!this.instance) {
      this.instance = new VibeCheckPopup();
    }
    return this.instance;
  }

  static override DEFAULT_OPTIONS = {
    id: "crowdgoeswild-vibe-check",
    classes: ["crowdgoeswild", "vibecheck"],
    tag: "div",
    window: {
      frame: true,
      positioned: true,
      title: "CrowdGoesWild - Vibe Check",
      icon: "fas fa-face-smile",
      controls: [],
      resizable: false,
    },
    position: {
      width: 600,
      height: "auto" as const,
    },
    actions: {
      selectReaction: VibeCheckPopup.#onSelectReaction,
    },
  };

  static override PARTS = {
    content: {
      template: `modules/${moduleId}/templates/VibeCheckPopup.hbs`,
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    const users = game.users?.players.filter((u) => u.active) ?? [];

    // Group the responses by user for display
    const groupedResponses: { user: User; responses: Reaction[] }[] = [];
    
    for (const user of users) {
      const filteredResponses: Reaction[] = [];
      for (const sentResponse of this.userResponses) {
        if (sentResponse.user.id === user.id) {
          filteredResponses.push(sentResponse.response);
        }
      }

      const userCharacter = user.character;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userWithImage = user as any;
      if (userCharacter) {
        userWithImage.image = userCharacter.img ?? user.avatar ?? "";
      } else {
        userWithImage.image = user.avatar ?? "";
      }

      groupedResponses.push({
        user: userWithImage,
        responses: filteredResponses,
      });
    }

    return {
      ...context,
      isGM: game.user?.isGM ?? false,
      reactions: (await game.settings?.get(moduleId, "reactions")) ?? [],
      responses: this.userResponses,
      groupedResponses: groupedResponses,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _onRender(context: object, options: any) {
    // Set up keyboard handler for number keys 1-6
    this.keyupHandler = (ev: KeyboardEvent) => {
      const key = parseInt(ev.key);
      if (key >= 1 && key <= 6) {
        sendVibeCheckResponse(game.user, key - 1);
        this.close();
      }
    };
    document.addEventListener("keyup", this.keyupHandler);
  }

  static async #onSelectReaction(this: VibeCheckPopup, event: Event, target: HTMLElement) {
    event.preventDefault();
    const reactionId = target.dataset.id;
    if (reactionId) {
      sendVibeCheckResponse(game.user, reactionId);
      this.close();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async close(options?: any): Promise<this> {
    // Clean up keyboard listener
    if (this.keyupHandler) {
      document.removeEventListener("keyup", this.keyupHandler);
      this.keyupHandler = null;
    }
    return super.close(options);
  }
}

export async function recordVibeCheckResponse(response: { user: User; response: string | number }) {
  const vc = VibeCheckPopup.getInstance();
  const reaction = await getReactionObject(String(response.response));
  if (reaction) {
    const userResponse: UserResponse = {
      user: response.user,
      response: reaction,
    };
    vc.userResponses.push(userResponse);
    vc.render();
  }
}
