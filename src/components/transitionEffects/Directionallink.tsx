import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { CUBE_TRANSITION_TYPES, type CubeDirection } from "@/lib/cubeTransition";

interface DirectionalLinkProps extends LinkProps {
  /** Which side this link visually sits on / which way the page should roll */
  direction: CubeDirection;
  className?: string;
  children: ReactNode;
}

export default function DirectionalLink({
  direction,
  href,
  className,
  children,
  ...rest
}: DirectionalLinkProps) {
  return (
    <Link
      href={href}
      transitionTypes={[CUBE_TRANSITION_TYPES[direction]]}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
