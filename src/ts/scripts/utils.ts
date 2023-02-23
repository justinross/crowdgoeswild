import { id as moduleId } from "../../../public/module.json"
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';

export function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

export function invlerp(x, y, a){
    return  clamp((a - x) / (y - x));
}

export function lerp (start, end, amt){
    return (1-amt)*start+amt*end
  }

export function clamp(a, min = 0, max = 1){
    return Math.min(max, Math.max(min, a));
}

export function calcAngleDegrees(x, y) {
    return Math.atan2(y, x) * 180 / Math.PI;
}

export async function getReactionAsImage(reactionObject){
    let reactionHTML = await getReactionHTML(reactionObject)
    let $interface = $("#interface")
    // let interfaceEl = $interface.get(0)
    // let $addedChild = $('<div id="interfaceShadow"></div>')
    // let addedChildEl = $addedChild.get(0)

    // let shadow = addedChildEl.attachShadow({mode: 'open'})
    let $appended = $(reactionHTML).appendTo($interface)
    $appended.css({zIndex: "-10000"})
    

    // $(shadow).append(reactionHTML)
    // let shadowEl = addedChildEl.shadowRoot
    let iconPNGData
    try {
        iconPNGData = await htmlToImage.toPng($appended.get(0))
    } catch (error) {
        console.error('oops, something went wrong!', error);
    }

    $appended.remove()
    return iconPNGData
}

export async function getReactionObject(reactionId){
    let reactions = await game.settings.get(moduleId, 'reactions') as []
    let reaction = reactions.find(r => r.id == reactionId)
    return reaction
}

export function getReactionHTML(reaction){
    let htmlString = `
        <i class="${reaction.style} fa-${reaction.icon} cgw-reaction" 
            data-id=${reaction.id}
            style="
                color: ${reaction.primaryColor}; 
                --fa-primary-color: ${reaction.primaryColor};
                --fa-secondary-color: ${reaction.secondaryColor};
                --fa-secondary-opacity: 1;
                position: absolute; 
                z-index: 100000;
                font-size: 4rem;" ></i>`
    return htmlString
}

export async function saveAllReactionPNGs(force = false){
    let reactions = await game.settings.get(moduleId, 'reactions') as []
    for (const reaction of reactions) {
        await generateReactionPNG(reaction, force)
    }
}

export async function generateReactionPNG(reactionObject, force){
    let macrosPath =  `worlds/${game.world.id}/assets/macros`
    let dirs_list = await FilePicker.browse("data", macrosPath).then(picker => picker.dirs)
    if (!dirs_list.includes(macrosPath + "/reactions")){
        console.log("Reactions macro folder doesn't exist. Creating it.");
        await FilePicker.createDirectory('data', macrosPath + '/reactions')
    }

    let imagesPath = macrosPath + "/reactions"
    let files_list = await FilePicker.browse("data", macrosPath + "/reactions").then(picker => picker.files)
    if (!files_list.includes(macrosPath + "/reactions" + `/reaction-${reactionObject.id}.png`) || force){
        console.log("Image does not yet exist or force flag was set. Generating.");
        let imageDataURL = await getReactionAsImage(reactionObject)
        let uploadResponse = await ImageHelper.uploadBase64(imageDataURL, `reaction-${reactionObject.id}.png`, imagesPath)
        return uploadResponse.path
    }
    else{
        console.log("Image already exists. Refusing to regenerate.")
        return 
    }


    
    
    // try {
    // } catch (error) {
    //     console.log("Folder exists. Using it!")
    // }
    // folderPath += "/reactions"
}

export async function getReactionPNGUrl(reactionId){
    return `/worlds/${game.world.id}/assets/macros/reactions/reaction-${reactionId}.png`
}