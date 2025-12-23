const moduleId = "crowdgoeswild";
import * as htmlToImage from "html-to-image";

import { handleReactionClick } from "./events";
import { initiateVibeCheck } from "./socket";
import { ReactionSetupMenu } from "./ReactionSetupMenu";
import type { Reaction } from "./types";

export function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function invlerp(x: number, y: number, a: number): number {
  return clamp((a - x) / (y - x));
}

export function lerp(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end;
}

export function clamp(a: number, min: number = 0, max: number = 1): number {
  return Math.min(max, Math.max(min, a));
}

export function calcAngleDegrees(x: number, y: number): number {
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export async function getReactionAsImage(reactionObject: Reaction): Promise<string | undefined> {
  let reactionHTML = await getReactionHTML(reactionObject);
  console.log("Generating PNG for reaction", reactionObject.id, reactionHTML);
  let $interface = $("#interface");
  let $appended = $(reactionHTML).appendTo($interface);
  // $appended.css({ zIndex: "-10000" });
  let iconPNGData: string | undefined;
  try {
    // Wait for fonts/images to load and layout to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let appEl = $appended.get(0);
    console.log("appEl for reaction", reactionObject.id, appEl);
    if (appEl) {
      const fontEmbedCSS = await htmlToImage.getFontEmbedCSS(appEl);
      console.log(fontEmbedCSS);
      // iconPNGData = await htmlToImage.toPng(appEl);
    }
    console.log("Generated PNG data for reaction", reactionObject.id, iconPNGData);
  } catch (error) {
    console.error("PNG generation failed for reaction", reactionObject.id, error);
    ui.notifications?.error(
      `Failed to generate PNG for reaction "${reactionObject.icon}". Check console for details.`
    );
  }

  $appended.remove();
  
  // Validate the generated PNG data URL
  if (iconPNGData) {
    if (!iconPNGData.startsWith('data:image/png;base64,')) {
      console.error("Invalid PNG data URL format for reaction", reactionObject.id);
      ui.notifications?.error(
        `Invalid image data for reaction "${reactionObject.icon}": Not a PNG data URL`
      );
      return undefined;
    }
    
    if (iconPNGData.length < 100) {
      console.error("PNG data URL too short for reaction", reactionObject.id, "Length:", iconPNGData.length);
      ui.notifications?.error(
        `Invalid image data for reaction "${reactionObject.icon}": PNG appears corrupted or incomplete`
      );
      return undefined;
    }
  }
  
  return iconPNGData;
}

export async function getReactionObject(reactionId: string): Promise<Reaction | undefined> {
  let reactions = game.settings?.get("crowdgoeswild", "reactions") ?? [];
  let reaction = reactions.find((r) => r.id == reactionId);
  return reaction;
}

export function getReactionHTML(reaction: Reaction): string {
  let htmlString = "";
  if (reaction.type == "fontawesome") {
    htmlString = `
          <i class="${reaction.reactionStyle} fa-${reaction.icon} cgw-reaction" 
              data-id=${reaction.id}
              style="
                  color: ${reaction.primaryColor}; 
                  --fa-primary-color: ${reaction.primaryColor};
                  --fa-secondary-color: ${reaction.secondaryColor};
                  font-size: ${reaction.fontSize}px;
              ">
          </i>`;
  } else if (
    reaction.type == "filepicker" &&
    ["png", "jpg", "jpeg", "webp", "avif", "svg", ".gif"].includes(
      reaction.path?.split(".").pop() ?? ""
    )
  ) {
    htmlString = `
          <img
            class="cgw-reaction" 
            data-id=${reaction.id}
            src="${reaction.path}"
            style="
              max-width: ${reaction.maxWidth}px;
              max-height: ${reaction.maxHeight}px;
            "
          />`;
  } else if (
    reaction.type == "filepicker" &&
    ["webm", "mp4", "m4v"].includes(reaction.path?.split(".").pop() ?? "")
  ) {
    htmlString = `
          <video class="cgw-reaction" data-id=${reaction.id} autoplay loop muted
            style="
              max-width: ${reaction.maxWidth}px;
              max-height: ${reaction.maxHeight}px;
            "
          >
            <source src="${reaction.path}" 
            type="video/${reaction.path?.split(".").pop()}"
            />
          </video>
          `;
  }
  return htmlString;
}

export async function saveAllReactionPNGs(force: boolean = false): Promise<void> {
  if (force) {
    ui.notifications?.info(
      `Generating icons for reaction macros. This will take a moment.`,
      { permanent: false }
    );
  }
  let reactions = game.settings?.get("crowdgoeswild", "reactions") ?? [];
  for (const reaction of reactions) {
    const ext = reaction.path?.split(".").pop();
    if (!ext || !["webm", "mp4", "m4v"].includes(ext)) {
      await generateReactionPNG(reaction, force);
    } else {
      console.log("Can't make images for video reactions", reaction);
    }
  }
}

export async function generateReactionPNG(reactionObject: Reaction, force: boolean): Promise<string | undefined> {
  if (!game.world) return;
  let worldPath = `worlds/${game.world.id}`;
  let iconsPath = `worlds/${game.world.id}/reactionIcons`;
  let world_dirs_list = await foundry.applications.apps.FilePicker.implementation.browse("data", worldPath).then(
    (picker) => picker.dirs
  );
  if (!world_dirs_list.includes(iconsPath)) {
    console.log("Reactions icon folder doesn't exist. Creating it.");
    await foundry.applications.apps.FilePicker.implementation.createDirectory("data", iconsPath);
  }

  let imagesPath = iconsPath;
  let files_list = await foundry.applications.apps.FilePicker.implementation.browse("data", iconsPath).then(
    (picker) => picker.files
  );
  if (
    !files_list.includes(iconsPath + `/reaction-${reactionObject.id}.png`) ||
    force
  ) {
    console.log("Image does not yet exist or force flag was set. Generating.");
    let imageDataURL = await getReactionAsImage(reactionObject);
    if (!imageDataURL) {
      console.warn("Skipping upload for reaction", reactionObject.id, "- invalid image data");
      return;
    }
    let uploadResponse = await foundry.helpers.media.ImageHelper.uploadBase64(
      imageDataURL,
      `reaction-${reactionObject.id}.png`,
      imagesPath
    );
    if (uploadResponse) return uploadResponse.path;
  } else {
    console.log("Image already exists. Refusing to regenerate.");
  }
  return undefined;
}

export async function getReactionPNGUrl(reactionId: string): Promise<string> {
  return `worlds/${game.world?.id}/reactionIcons/reaction-${reactionId}.png`;
}

export async function renderChatButtonBar() {
  // Remove any existing container first
  let $cgwContainer = $(".cgwcontainer");
  $cgwContainer.remove();

  // Foundry v13 uses a different chat structure
  // The chat form is inside the chat sidebar element
  let $chatForm: JQuery = $("#chat form");
  
  if ($chatForm.length === 0) {
    console.warn("CrowdGoesWild: Could not find chat form element to attach reaction bar");
    return;
  }
  
  let templatePath = `modules/${moduleId}/templates/parts/ReactionButtonBar.hbs`;
  let templateData = {
    reactions: game.settings?.get("crowdgoeswild", "reactions") ?? [],
    isGM: game.user?.isGM ?? false,
  };

  foundry.applications.handlebars.renderTemplate(templatePath, templateData)
    .then((c) => {
      if (c.length > 0 && $chatForm.length > 0) {
        let $content = $(c);
        $chatForm.after($content);

        $content.find(".reactionbar button").on("click", (event) => {
          console.log("REACTION CLICK", event.target);
          event.preventDefault();
          let $self = $(event.currentTarget);
          let dataset = event.currentTarget.dataset;
          let id = dataset.id;
          handleReactionClick(id);
        });

        $content.find(".reactionbar button").on("dragstart", (event) => {
          event.originalEvent?.dataTransfer?.setData(
            "text/plain",
            JSON.stringify({
              id: event.currentTarget.dataset.id,
              type: "reaction",
            })
          );
        });

        $content.find("button.vibecheck").on("click", (event) => {
          console.log("VIBE CHECK");
          initiateVibeCheck();
        });

        $content.find("button.cgwSettings").on("click", (event) => {
          console.log("OPEN SETTINGS");
          let reactionSetup = new ReactionSetupMenu();
          reactionSetup.render({force: true});
        });
      }
    })
    .catch((e) => console.error(e));
}
// export const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 500);
