import "./styles/crowdgoeswild.scss";
import { animationInit } from "./ts/scripts/animation";
import registerHooks from "./ts/scripts/hooks";

// declare global {
//   interface LenientGlobalVariableTypes {
//     game: never; // the type doesn't matter
//   }
// }

// const referenceToGame: Game = game; // ok! :)

registerHooks();
animationInit();

// buttons for reactions
// send reaction to other clients
// display reaction from all clients
