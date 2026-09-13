import styles from "./MarqueeText.module.css";

interface MarqueeTextProps {
  text: string;
}

export default function MarqueeText({ text }: MarqueeTextProps) {
  return (
    <div className={`absolute inset-0 ${styles.wrapper}`}>
      <span className={styles.text}>{text}</span>
    </div>
  );
}
