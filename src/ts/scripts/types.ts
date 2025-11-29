export interface Reaction {
  id: string;
  speed: string;
  enabled: string;
  title: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  style: string;
  effect: string;
  directional: boolean;
  type: "fontawesome" | "filepicker";
  path: string;
  maxWidth: number;
  maxHeight: number;
  fontSize: number;
}

// Module settings declaration for type-safe settings access
// Uses the "namespace.key" format as required by fvtt-types
declare module "fvtt-types/configuration" {
  interface SettingConfig {
    "crowdgoeswild.reactions": Reaction[];
    "crowdgoeswild.vibecheckautoclose": boolean;
    "crowdgoeswild.vibecheckduration": number;
    "crowdgoeswild.moduleVersion": string;
    "crowdgoeswild.maxdisplayed": number;
  }
}
