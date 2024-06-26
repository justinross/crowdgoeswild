// only required for dev
// in prod, foundry loads crowdgoeswild.js, which is compiled by vite/rollup
// in dev, foundry loads crowdgoeswild.js, this file, which loads crowdgoeswild.ts

window.global = window; // some of your dependencies might need this
import "./crowdgoeswild.ts";
