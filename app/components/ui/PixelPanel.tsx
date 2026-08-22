import React from "react";
import styles from "./PixelPanel.module.scss";

type PixelPanelProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  title?: string;
  tone?: "parchment" | "wood";
};

export default function PixelPanel({ children, className = "", as = "div", title, tone = "parchment" }: PixelPanelProps) {
  const Tag = as;
  const toneClass = tone === "wood" ? styles.panelWood : "";
  return (
    <Tag className={`${styles.panel} ${toneClass} ${className}`}>
      {title && <div className={styles.panelTitle}>{title}</div>}
      <div className={styles.panelBody}>{children}</div>
    </Tag>
  );
}
