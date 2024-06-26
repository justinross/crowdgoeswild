import { ReactionSetupMenu } from "./ReactionSetupMenu";
import { saveAllReactionPNGs } from "./utils";
import { reactionSets } from "./reactionsets";

const moduleId = "crowdgoeswild";
export const ReactionOption = {
  id: 0,
  title: "",
  icon: "",
  primaryColor: "",
  secondaryColor: "",
  style: "",
  speed: 0,
  effect: "",
  directional: false,
  enabled: true,
  type: "",
  path: "",
  maxWidth: 200,
  maxHeight: 200,
};

export const typeOptions = [
  {
    label: "Image/Video",
    value: "filepicker",
  },
  {
    label: "Font Icon",
    value: "fontawesome",
  },
];

export type ReactionOption = typeof ReactionOption;

export async function loadReactionsPreset(presetName: string) {
  let reactions = reactionSets[presetName].reactions;
  await game.settings.set(moduleId, "reactions", reactions);
  //   await saveAllReactionPNGs(true);
  //   debouncedReload();
  return;
}

export function registerSettings() {
  console.log("Registering CGW Settings");
  game.settings.register(moduleId, "reactions", {
    name: "Reaction",
    hint: "The list of reactions usable by your players",
    scope: "world", // "world" = sync to db, "client" = local storage
    config: false, // false if you dont want it to show in module config
    type: Array, // Number, Boolean, String, Object
    default: reactionSets["default"].reactions,
    onChange: (value) => {
      // value is the new value of the setting
    },
  });

  game.settings.register(moduleId, "vibecheckautoclose", {
    name: "Close vibe check after selection",
    hint: "If this is enabled, players' vibe check popups will close after they make a selection. If this is disabled, it will stay open and they can choose another reaction.",
    scope: "world", // "world" = sync to db, "client" = local storage
    config: true, // false if you dont want it to show in module config
    type: Boolean, // Number, Boolean, String, Object
    default: true,
    onChange: (value) => {
      // value is the new value of the setting
    },
  });

  game.settings.register(moduleId, "vibecheckduration", {
    name: "Vibe check duration",
    hint: "This determines, in seconds, how long players have to respond to a vibe check. The results will display to the GM for twice this duration. 0 = no timeout",
    scope: "world", // "world" = sync to db, "client" = local storage
    config: true, // false if you dont want it to show in module config
    type: Number, // Number, Boolean, String, Object
    default: 10,
    range: {
      min: 0,
      step: 10,
      max: 60,
    },
    onChange: (value) => {
      // value is the new value of the setting
    },
  });

  game.settings.register(moduleId, "moduleVersion", {
    scope: "world", // "world" = sync to db, "client" = local storage
    config: false, // false if you dont want it to show in module config
    type: String, // Number, Boolean, String, Object
    default: "1.0.0-alpha4",
  });

  game.settings.register(moduleId, "maxdisplayed", {
    name: "Maximum Simultaneous Reactions",
    hint: `Turn this down if you're running into performance issues from players spamming reactions.`,
    scope: "client",
    config: false,
    type: Number,
    range: {
      min: 10,
      max: 200,
      step: 5,
    },
    default: 200,
  });

  // game.settings.registerMenu(moduleId, "reactionSetup", {
  //   name: "Reactions",
  //   label: "Configure Available Reactions", // The text label used in the button
  //   hint: "Use this menu to create up to eight reactions for your players to use during play.",
  //   icon: "fas fa-bars", // A Font Awesome icon used in the submenu button
  //   type: ReactionSetupMenu, // A FormApplication subclass
  //   restricted: true, // Restrict this submenu to gamemaster only?
  // });
}
