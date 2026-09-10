"use client";

import { useMemo } from "react";
import { generateSquareSpiralPath } from "@/lib/generateSquareSpiral";
import styles from "./SpiralText.module.css";

interface SpiralTextProps {
	  text: string;
}

export default function SpiralText({ text }: SpiralTextProps) {
  const path = useMemo(() => generateSquareSpiralPath(6, 18), []);

  return (
    <div className={styles.anchor}>
      <div
        className={styles.mover}
        style={{ offsetPath: `path("${path}")` }}
      >
        <pre className={styles.text}>{text}</pre>
      </div>
    </div>
  );
}
