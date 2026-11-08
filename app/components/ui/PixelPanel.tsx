import React from "react";
import styles from "./PixelPanel.module.scss";

type PixelPanelProps = {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: "div" | "section" | "article";
  /** Shown in the gold title bar. */
  title?: React.ReactNode;
  /** Heading level for the title (defaults to h3, since panels sit under a section's h2). */
  titleAs?: "h2" | "h3" | "div";
  /** Extra content on the right of the title bar, e.g. an ID number. */
  titleAside?: React.ReactNode;
  titleId?: string;
};

/** The one panel surface: cream, ink border, hard shadow, optional gold title bar. */
export default function PixelPanel({
  children,
  className = "",
  bodyClassName = "",
  as = "div",
  title,
  titleAs: TitleTag = "h3",
  titleAside,
  titleId,
}: PixelPanelProps) {
  const Tag = as;
  return (
    <Tag className={`${styles.panel} ${className}`}>
      {title && (
        <div className={styles.titleBar}>
          <TitleTag id={titleId} className={styles.title}>
            {title}
          </TitleTag>
          {titleAside && <span className={styles.titleAside}>{titleAside}</span>}
        </div>
      )}
      <div className={`${styles.panelBody} ${bodyClassName}`}>{children}</div>
    </Tag>
  );
}
