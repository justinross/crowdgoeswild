import { id as moduleId } from "../../../public/module.json";
import { sendVibeCheckResponse } from "./socket";
import { getReactionObject } from "./utils";

type userResponse = {
  user: {};
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
      classes: ["form", "crowdgoeswild", "vibecheck"],
      popOut: true,
      template: `modules/${moduleId}/templates/VibeCheckPopup.hbs`,
      id: `${moduleId}-vibe-check`,
      title: "CrowdGoesWild - Vibe Check",
      width: 600,
      height: "auto",
    });
  }

  async getData(): object | Promise<object> {
    let users = await game.users.players.filter((u) => u.active);

    //group the responses by user for display. Variable naming is awful here.
    let groupedResponses = [];
    for (const user of users) {
      let filteredResponses = [];
      for (const sentResponse of this.userResponses) {
        if (sentResponse.user._id == user.id) {
          filteredResponses.push(sentResponse.response);
        }
      }

      let userResponses = {
        user: user,
        responses: filteredResponses,
      };

      groupedResponses.push(userResponses);
    }

    let data = {
      isGM: game.user.isGM,
      reactions: await game.settings.get(moduleId, "reactions"),
      responses: this.userResponses,
      groupedResponses: groupedResponses,
    };

    return data;
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    html.find("button.reaction").on("click", (ev) => {
      sendVibeCheckResponse(game.user, ev.currentTarget.dataset.id);
    });
  }
}

export async function recordVibeCheckResponse(response) {
  let vc = VibeCheckPopup.getInstance();
  let reaction = await getReactionObject(response.response);
  let user = response.user;
  response = {
    user: user,
    response: reaction,
  };
  vc.userResponses.push(response);
  vc.render(false);
}
