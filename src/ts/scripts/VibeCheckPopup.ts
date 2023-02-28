import { id as moduleId } from "../../../public/module.json";
import { sendVibeCheckResponse } from "./socket";
import { getReactionObject } from "./utils";

type userResponse = {
  user: String;
  response: Number;
};

export default class VibeCheckPopup extends Application {
  static instance;
  userResponses: userResponse[] = [];

  static getInstance() {
    if (!this.instance) {
      this.instance = new VibeCheckPopup();
    }

    return this.instance;
  }

  /**
   * override
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["form", "crowdgoeswild", "reactionSetup"],
      popOut: true,
      template: `modules/${moduleId}/templates/VibeCheckPopup.hbs`,
      id: `${moduleId}-vibe-check`,
      title: "CrowdGoesWild - Vibe Check",
      width: 900,
    });
  }

  async getData(): object | Promise<object> {
    let data = {
      isGM: game.user.isGM,
      reactions: await game.settings.get(moduleId, "reactions"),
      responses: this.userResponses,
    };

    return data;
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    html.find("button.reaction").on("click", (ev) => {
      sendVibeCheckResponse(game.userId, ev.currentTarget.dataset.id);
    });
  }
}

export async function recordVibeCheckResponse(response) {
  let vc = VibeCheckPopup.getInstance();
  let reaction = await getReactionObject(response.response);
  response = {
    user: response.user,
    response: reaction,
  };
  vc.userResponses.push(response);
  vc.render(false);
}
