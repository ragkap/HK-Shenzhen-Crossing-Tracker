// Control-point names exactly as they appear in the Immigration Department CSV.
export const SHENZHEN_LAND_CROSSINGS = [
  "Lo Wu",
  "Lok Ma Chau",
  "Lok Ma Chau Spur Line",
  "Shenzhen Bay",
  "Heung Yuen Wai",
  "Man Kam To",
] as const;

export const EXPRESS_RAIL = "Express Rail Link West Kowloon";
export const HZMB = "Hong Kong-Zhuhai-Macao Bridge";

// All crossings the dashboard fetches/aggregates over.
export const TRACKED_CROSSINGS = [
  ...SHENZHEN_LAND_CROSSINGS,
  EXPRESS_RAIL,
  HZMB,
] as const;

export type Crossing = (typeof TRACKED_CROSSINGS)[number];

// Sub-groupings called out by the user: Lo Wu / Lok Ma Chau feed Sheung Shui
// (where Lung Fung's densest store cluster sits); Shenzhen Bay / Heung Yuen
// Wai / Man Kam To lean more toward HK residents heading north.
export const SHEUNG_SHUI_FEED = [
  "Lo Wu",
  "Lok Ma Chau",
  "Lok Ma Chau Spur Line",
] as const;

export const RESIDENT_LEANING = [
  "Shenzhen Bay",
  "Heung Yuen Wai",
  "Man Kam To",
] as const;

// Validated categorical theme (dataviz skill default order), one hue per
// crossing. Light/dark pairs pass CVD + contrast checks on the adjacent
// pairlist; beyond 3 series a line chart relies on the legend + hover
// tooltip (direct labeling) rather than hue alone to carry identity.
export const CROSSING_COLORS: Record<string, { light: string; dark: string }> = {
  "Lo Wu": { light: "#2a78d6", dark: "#3987e5" },
  "Lok Ma Chau": { light: "#eb6834", dark: "#d95926" },
  "Lok Ma Chau Spur Line": { light: "#1baf7a", dark: "#199e70" },
  "Shenzhen Bay": { light: "#eda100", dark: "#c98500" },
  "Heung Yuen Wai": { light: "#e87ba4", dark: "#d55181" },
  "Man Kam To": { light: "#008300", dark: "#008300" },
  "Express Rail Link West Kowloon": { light: "#4a3aa7", dark: "#9085e9" },
  "Hong Kong-Zhuhai-Macao Bridge": { light: "#e34948", dark: "#e66767" },
};

// Primary flow colors: southbound uses the site accent, northbound its
// validated complement. Passes CVD + normal-vision checks in both modes.
export const FLOW_COLORS = {
  southbound: { light: "#24a9a7", dark: "#24a9a7" },
  northbound: { light: "#eb6834", dark: "#d95926" },
};
