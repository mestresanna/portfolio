"use client";

import styles from "./SquareText.module.css";

interface SquareTextProps {
  text: string;
  size?: number;       // side length of the square, in px
  duration?: number;   // seconds for one full loop
  fontSize?: number;   // px
  color?: string;
}

function generateSquarePath(size: number) {
  const half = size / 2;
  return `M ${-half} ${-half} L ${half} ${-half} L ${half} ${half} L ${-half} ${half} Z`;
}

export default function SquareText({
  text,
  size = 300,
  duration = 8,
  fontSize = 18,
  color = "white",
}: SquareTextProps) {
  const path = generateSquarePath(size);

  return (
    <div className={styles.anchor}>
      <div
        className={styles.mover}
        style={{
          offsetPath: `path("${path}")`,
          animationDuration: `${duration}s`,
        }}
      >
        <span
          className={styles.text}
          style={{ fontSize: `${fontSize}px`, color }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
