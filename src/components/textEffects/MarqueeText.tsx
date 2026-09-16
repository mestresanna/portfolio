import styles from "./MarqueeText.module.css";

interface MarqueeTextProps {
  text: string;
}

export default function MarqueeText({ text }: MarqueeTextProps) {
  return (
    <div className={`absolute inset-0 ${styles.wrapper}`}>
      <div className={styles.track}>
        <span className={styles.text}> {text} </span>

        <span className={styles.text} aria-hidden="true">
         .  {text}
        </span>
      </div>
    </div>
  );
}
