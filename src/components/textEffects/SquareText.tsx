"use client";

import styles from "./SquareText.module.css";

interface SquareTextProps {
  text: string;
  size?: number;        // side length of the square, in px
  duration?: number;    // seconds for one full loop
  fontSize?: number;    // px
  color?: string;
  letterDelay?: number; // seconds of phase offset between consecutive letters
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
  letterDelay = 0.15,
}: SquareTextProps) {
  const path = generateSquarePath(size);
  const letters = Array.from(text);

  return (
    <div className={styles.anchor}>
      {letters.map((char, i) => (
        <span
          key={i}
          className={styles.mover}
          style={{
            offsetPath: `path("${path}")`,
            animationDuration: `${duration}s`,
            animationDelay: `${-i * letterDelay}s`, // negative = stagger phase, not start time
            fontSize: `${fontSize}px`,
            color,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}
