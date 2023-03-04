import { id as moduleId } from "../../../public/module.json";
import * as htmlToImage from "html-to-image";
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from "html-to-image";
import { handleReactionClick } from "./events";
import { initiateVibeCheck } from "./socket";
import { ReactionSetupMenu } from "./ReactionSetupMenu";

export function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

export function invlerp(x, y, a) {
  return clamp((a - x) / (y - x));
}

export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

export function clamp(a, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a));
}

export function calcAngleDegrees(x, y) {
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export async function getReactionAsImage(reactionObject) {
  let reactionHTML = await getReactionHTML(reactionObject);
  let $interface = $("#interface");
  let $appended = $(reactionHTML).appendTo($interface);
  $appended.css({ zIndex: "-10000" });
  let iconPNGData;
  try {
    let appEl = $appended.get(0);
    iconPNGData = await htmlToImage.toPng(appEl);
  } catch (error) {
    console.error("oops, something went wrong!", error);
  }

  // $appended.remove();
  return iconPNGData;
}

export async function getReactionObject(reactionId) {
  let reactions = (await game.settings.get(moduleId, "reactions")) as [];
  let reaction = reactions.find((r) => r.id == reactionId);
  return reaction;
}

export function getReactionHTML(reaction) {
  let htmlString = "";
  if (reaction.type == "fontawesome") {
    htmlString = `
          <i class="${reaction.style} fa-${reaction.icon} cgw-reaction" 
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
      reaction.path?.split(".").pop()
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
    ["webm", "mp4", "m4v"].includes(reaction.path?.split(".").pop())
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

export async function saveAllReactionPNGs(force = false) {
  if (force) {
    ui.notifications.info(
      `Generating icons for reaction macros. This will take a moment.`,
      { permanent: false }
    );
  }
  let reactions = (await game.settings.get(moduleId, "reactions")) as [];
  for (const reaction of reactions) {
    if (!["webm", "mp4", "m4v"].includes(reaction.path?.split(".").pop())) {
      console.log("Not a video", reaction);
      await generateReactionPNG(reaction, force);
    } else {
      console.log("Can't make images for video reactions", reaction);
    }
  }
}

export async function generateReactionPNG(reactionObject, force) {
  let worldPath = `worlds/${game.world.id}`;
  let iconsPath = `worlds/${game.world.id}/reactionIcons`;
  let world_dirs_list = await FilePicker.browse("data", worldPath).then(
    (picker) => picker.dirs
  );
  if (!world_dirs_list.includes(iconsPath)) {
    console.log("Reactions icon folder doesn't exist. Creating it.");
    await FilePicker.createDirectory("data", iconsPath);
  }
  // let macros_dirs_list = await FilePicker.browse("data", macrosPath).then(picker => picker.dirs)
  // if (!macros_dirs_list.includes(macrosPath + "/reactions")){
  //     console.log("Reactions macro folder doesn't exist. Creating it.");
  //     await FilePicker.createDirectory('data', macrosPath + '/reactions')
  // }

  let imagesPath = iconsPath;
  let files_list = await FilePicker.browse("data", iconsPath).then(
    (picker) => picker.files
  );
  if (
    !files_list.includes(iconsPath + `/reaction-${reactionObject.id}.png`) ||
    force
  ) {
    console.log("Image does not yet exist or force flag was set. Generating.");
    let imageDataURL = await getReactionAsImage(reactionObject);
    let uploadResponse = await ImageHelper.uploadBase64(
      imageDataURL,
      `reaction-${reactionObject.id}.png`,
      imagesPath
    );
    return uploadResponse.path;
  } else {
    console.log("Image already exists. Refusing to regenerate.");
    return;
  }
}

export async function getReactionPNGUrl(reactionId) {
  return `worlds/${game.world.id}/reactionIcons/reaction-${reactionId}.png`;
}

export async function renderChatButtonBar() {
  let $chatForm = $("#chat-form");
  let $cgwContainer = $(".cgwcontainer");
  $cgwContainer.remove();
  let templatePath = `modules/${moduleId}/templates/parts/ReactionButtonBar.hbs`;
  let templateData = {
    reactions: (await game.settings.get(moduleId, "reactions")) as [],
    isGM: game.user.isGM,
  };

  renderTemplate(templatePath, templateData)
    .then((c) => {
      if (c.length > 0) {
        let $content = $(c);
        $chatForm.after($content);

        $content.find(".reactionbar button").on("click", (event) => {
          event.preventDefault();
          let $self = $(event.currentTarget);
          let dataset = event.currentTarget.dataset;
          let id = dataset.id;
          handleReactionClick(id);
        });

        $content.find(".reactionbar button").on("dragstart", (event) => {
          event.originalEvent.dataTransfer.setData(
            "text/plain",
            JSON.stringify({
              id: event.currentTarget.dataset.id,
              type: "reaction",
            })
          );
        });

        $content.find("button.vibecheck").on("click", (event) => {
          initiateVibeCheck();
        });

        $content.find("button.cgwSettings").on("click", (event) => {
          let reactionSetup = new ReactionSetupMenu();
          reactionSetup.render(true);
        });
      }
    })
    .catch((e) => console.error(e));
}
// export const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 500);
