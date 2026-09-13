import { ViewTransition } from "react";
import { CUBE_TRANSITION_TYPES } from "@/lib/cubeTransition";

const cubeClassMap = {
  [CUBE_TRANSITION_TYPES.left]: CUBE_TRANSITION_TYPES.left,
  [CUBE_TRANSITION_TYPES.right]: CUBE_TRANSITION_TYPES.right,
  [CUBE_TRANSITION_TYPES.top]: CUBE_TRANSITION_TYPES.top,
  [CUBE_TRANSITION_TYPES.bottom]: CUBE_TRANSITION_TYPES.bottom,
  default: "none",
};

export default function CubeViewTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransition enter={cubeClassMap} exit={cubeClassMap} default="none">
      {children}
    </ViewTransition>
  );
}
