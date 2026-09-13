export type CubeDirection = "left" | "right" | "top" | "bottom";

/**
 * Direction -> Next.js `transitionTypes` name, used by both DirectionalLink
 * (to tag the navigation) and CubeViewTransition (to map that type to a
 * view-transition CSS class). The actual roll animation lives in
 * globals.css as `.cube-left` / `.cube-right` / `.cube-top` / `.cube-bottom`
 * `::view-transition-old/new` rules — keep the strings below in sync with
 * those selectors, since CSS can't import from TS.
 */
export const CUBE_TRANSITION_TYPES: Record<CubeDirection, string> = {
  left: "cube-left",
  right: "cube-right",
  top: "cube-top",
  bottom: "cube-bottom",
};
