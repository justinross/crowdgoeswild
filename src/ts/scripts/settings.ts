import {ReactionSetupMenu} from "./ReactionSetupMenu";
import { id as moduleId } from "../../../public/module.json"

let defaultReactions = [
    {
        id: 0,
        title: "Like",
        icon: "heart",
        primaryColor: "#eb34b1",
        secondaryColor: "",
        style: "fas",
        speed: 1,
        effect: "physics-floatUp",
        directional: false
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
        directional: false
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
        directional: true
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
        directional: false
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
        directional: false
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
        directional: false
    },

]

type Reaction = {
    id: Number,
    title: string,
    icon: string,
    primaryColor: string,
    secondaryColor: string,
    style: string,
    speed: Number,
    effect: string,
    directional: boolean
}

export default function registerSettings() {
    console.log("Registering CGW Settings")
    game.settings.register(moduleId, 'reactions', {
        name: 'Reaction 1',
        hint: 'A description of the registered setting and its behavior.',
        scope: 'world', // "world" = sync to db, "client" = local storage
        config: false, // false if you dont want it to show in module config
        type: Array, // Number, Boolean, String, Object
        default: defaultReactions,
        onChange: value => { // value is the new value of the setting
            console.log(value)
        }
    });

    game.settings.register(moduleId, 'maxdisplayed', {
        name: 'Maximum Simultaneous Reactions',
        hint: `Turn this down if you're running into performance issues from players spamming reactions.`,
        scope: 'client',
        config: true,
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

