import {
  ADDON_CATEGORY,
  ADDON_TYPE,
  PLUGIN_TYPE,
  PROPERTY_TYPE,
} from "./template/enums.js";
import _version from "./version.js";
export const addonType = ADDON_TYPE.BEHAVIOR;
export const type = PLUGIN_TYPE.OBJECT;
export const id = "salmanshh_simple_weapon";
export const name = "Simple Weapon";
export const version = _version;
export const minConstructVersion = undefined;
export const author = "SalmanShh";
export const website = "https://www.construct.net";
export const documentation = "https://www.construct.net";
export const description = "Handle firing, reloading, ammo management, and multiple fire modes without complex events. Perfect for shooters, action games, and any project needing weapon systems.";
export const category = ADDON_CATEGORY.OTHER;

export const hasDomside = false;
export const files = {
  extensionScript: {
    enabled: false, // set to false to disable the extension script
    watch: true, // set to true to enable live reload on changes during development
    targets: ["x86", "x64"],
    // you don't need to change this, the build step will rename the dll for you. Only change this if you change the name of the dll exported by Visual Studio
    name: "MyExtension",
  },
  fileDependencies: [],
  remoteFileDependencies: [
    // {
    //   src: "https://example.com/api.js", // Must use https:// or same-protocol // URLs. http:// is not allowed.
    //   type: "" // Optional: "" or "module". Empty string or omit for classic script.
    // }
  ],
  cordovaPluginReferences: [],
  cordovaResourceFiles: [],
};

// categories that are not filled will use the folder name
export const aceCategories = {};

export const info = {
  // icon: "icon.svg",
  // PLUGIN world only
  // defaultImageUrl: "default-image.png",
  Set: {
    // COMMON to all
    CanBeBundled: true,
    IsDeprecated: false,
    GooglePlayServicesEnabled: false,

    // BEHAVIOR only
    IsOnlyOneAllowed: false,

    // PLUGIN world only
    IsResizable: false,
    IsRotatable: false,
    Is3D: false,
    HasImage: false,
    IsTiled: false,
    SupportsZElevation: false,
    SupportsColor: false,
    SupportsEffects: false,
    MustPreDraw: false,

    // PLUGIN object only
    IsSingleGlobal: false,
  },
  // PLUGIN only
  AddCommonACEs: {
    Position: false,
    SceneGraph: false,
    Size: false,
    Angle: false,
    Appearance: false,
    ZOrder: false,
  },
};

export const properties = [
  // Ammo Settings
  {
    type: PROPERTY_TYPE.INTEGER,
    id: "max_ammo",
    options: {
      initialValue: 30,
      minValue: 1,
    },
    name: "Max Ammo",
    desc: "Maximum ammunition capacity",
  },
  {
    type: PROPERTY_TYPE.INTEGER,
    id: "starting_ammo",
    options: {
      initialValue: 30,
      minValue: 0,
    },
    name: "Starting Ammo",
    desc: "Ammunition when the weapon is created",
  },
  // Fire Settings
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "fire_rate",
    options: {
      initialValue: 0.1,
      minValue: 0.01,
    },
    name: "Fire Rate",
    desc: "Time between shots in seconds",
  },
  {
    type: PROPERTY_TYPE.COMBO,
    id: "fire_mode",
    options: {
      initialValue: "single",
      items: [
        { single: "Single Shot" },
        { automatic: "Automatic" },
        { burst: "Burst Fire" },
      ],
    },
    name: "Fire Mode",
    desc: "The firing mode of the weapon",
  },
  {
    type: PROPERTY_TYPE.INTEGER,
    id: "burst_count",
    options: {
      initialValue: 3,
      minValue: 2,
    },
    name: "Burst Count",
    desc: "Number of shots in burst fire mode",
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "burst_delay",
    options: {
      initialValue: 0.05,
      minValue: 0.01,
    },
    name: "Burst Delay",
    desc: "Time between shots in a burst (seconds)",
  },
  // Projectile Settings
  {
    type: PROPERTY_TYPE.INTEGER,
    id: "image_point",
    options: {
      initialValue: 0,
      minValue: 0,
    },
    name: "Image Point",
    desc: "Image point index to spawn projectiles from",
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "spread_angle",
    options: {
      initialValue: 0,
      minValue: 0,
    },
    name: "Spread Angle",
    desc: "Random spread angle in degrees (0 for no spread)",
  },
  // Reload Settings
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "reload_time",
    options: {
      initialValue: 2.0,
      minValue: 0,
    },
    name: "Reload Time",
    desc: "Time to reload in seconds",
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "auto_reload",
    options: {
      initialValue: true,
    },
    name: "Auto Reload",
    desc: "Automatically reload when empty and firing",
  },
];
