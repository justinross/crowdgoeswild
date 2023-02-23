import {ReactionSetupMenu} from "./ReactionSetupMenu";
import { id as moduleId } from "../../../public/module.json"
import { debouncedReload, saveAllReactionPNGs } from "./utils";

export const defaultReactions: Array<ReactionOptions> = [
    {
        id: 0,
        title: "Like",
        icon: "heart",
        primaryColor: "#eb34b1",
        secondaryColor: "",
        style: "fas",
        speed: 1,
        effect: "physics-floatUp",
        directional: false,
        enabled: true
    },
    {
        id: 1,
        title: "OMG",
        icon: "triangle-exclamation",
        primaryColor: "#f5ad42",
        secondaryColor: "",
        style: "fas",
        speed: 1,
        effect: "physics-floatUp",
        directional: false,
        enabled: true
    },
    {
        id: 2,
        title: "Axe",
        icon: "axe",
        primaryColor: "#5f7e96",
        secondaryColor: "",
        style: "fas",
        speed: 1,
        effect: "physics-toss",
        directional: true,
        enabled: true
    },
    {
        id: 3,
        title: "droplet",
        icon: "droplet",
        primaryColor: "#00a6ff",
        secondaryColor: "",
        style: "fas",
        speed: 1,
        effect: "physics-drop",
        directional: false,
        enabled: true
    },
    {
        id: 4,
        title: "fire",
        icon: "fire",
        primaryColor: "#dd0000",
        secondaryColor: "#eb8c34",
        style: "fa-duotone",
        speed: 1,
        effect: "floatUp",
        directional: false,
        enabled: true
    },
    {
        id: 5,
        title: "x",
        icon: "times",
        primaryColor: "#dd0000",
        secondaryColor: "rgba(255,255,255,0.6)",
        style: "fas",
        speed: 1,
        effect: "shutdown",
        directional: false,
        enabled: true
    },

]

type ReactionOptions = {
    id: Number,
    title: string,
    icon: string,
    primaryColor: string,
    secondaryColor: string,
    style: string,
    speed: Number,
    effect: string,
    directional: boolean,
    enabled: boolean
}

export async function resetDefaultReactions(){
    await game.settings.set(moduleId, 'reactions', defaultReactions)
    await saveAllReactionPNGs(true)
    debouncedReload()
    return 
}

export function registerSettings() {
    console.log("Registering CGW Settings")
    game.settings.register(moduleId, 'reactions', {
        name: 'Reaction',
        hint: 'The list of reactions usable by your players',
        scope: 'world', // "world" = sync to db, "client" = local storage
        config: false, // false if you dont want it to show in module config
        type: Array, // Number, Boolean, String, Object
        default: defaultReactions,
        onChange: value => { // value is the new value of the setting
            
        }
    });

    game.settings.register(moduleId, 'maxdisplayed', {
        name: 'Maximum Simultaneous Reactions',
        hint: `Turn this down if you're running into performance issues from players spamming reactions.`,
        scope: 'client',
        config: false,
        type: Number,
        range: {
            min: 10,
            max: 200,
            step: 5
        },
        default: 200
    })

    game.settings.registerMenu(moduleId, 'reactionSetup', {
        name: "Reactions",
        label: "Configure Available Reactions", // The text label used in the button
        hint: "Use this menu to create up to eight reactions for your players to use during play.",
        icon: "fas fa-bars", // A Font Awesome icon used in the submenu button
        type: ReactionSetupMenu, // A FormApplication subclass
        restricted: true // Restrict this submenu to gamemaster only?
    });
}

