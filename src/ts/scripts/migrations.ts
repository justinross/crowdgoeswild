import { id as moduleId } from "../../../public/module.json";
import * as semver from "semver";

export default async function runMigrationChecks() {
  // don't do anything if we're running a local dev version without a real version number filled in
  let module = await game.modules.get("crowdgoeswild");
  let installedVersion = module.version;
  console.log(installedVersion);
  if (installedVersion == "#{VERSION}#") {
    console.log(
      "No version number available. Skipping migration. Things might run wonky."
    );
    return;
  } else {
    let oldVersion;
    try {
      oldVersion = await game.settings.get(moduleId, "moduleVersion");
    } catch (error) {
      console.log(
        "moduleVersion setting not registered somehow. Must be pre-1.0.0a4"
      );
      oldVersion = "1.0.0-alpha4";
    }

    console.log("---- Running migration checks ----");

    if (semver.lt(oldVersion, "1.0.0-alpha5")) {
      console.log("Pre-1.0.0-alpha5. Adding updated reaction fields");
      addTypeToReactions(game.settings.get(moduleId, "reactions"));
    } else {
      console.log("No migrations needed.");
    }

    game.settings.set(moduleId, "moduleVersion", installedVersion);
  }
}

async function addTypeToReactions(reactions) {
  let newReactions = reactions.map((reaction) => {
    if (!reaction.type) {
      reaction.type = "fontawesome";
    }
    if (!reaction.path) {
      reaction.path = "";
    }
    if (!reaction.maxWidth) {
      reaction.maxWidth = 200;
    }
    if (!reaction.maxHeight) {
      reaction.maxHeight = 200;
    }
    if (!reaction.fontSize) {
      reaction.fontSize = 48;
    }
    return reaction;
  });
  game.settings.set(moduleId, "reactions", newReactions);
}
