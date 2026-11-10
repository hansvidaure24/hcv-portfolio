import { Fragment } from "react";
import type { Diagram, DiagramLink } from "../../../data/diagrams";
import styles from "./SystemDiagram.module.scss";

function Arrow({ label, back = false }: { label: string; back?: boolean }) {
  return (
    <span className={`${styles.arrow} ${back ? styles.back : styles.forward}`}>
      <span className={styles.line} aria-hidden="true" />
      {label && (
        <span className={styles.label}>
          {/* The arrows are drawn, so say the direction for screen readers. */}
          <span className={styles.srOnly}>{back ? "Sends back: " : "Sends on: "}</span>
          {label}
        </span>
      )}
    </span>
  );
}

function Link({ link }: { link: DiagramLink }) {
  return (
    <div className={styles.link}>
      <Arrow label={link.forward} />
      {link.back !== undefined && <Arrow label={link.back} back />}
    </div>
  );
}

/**
 * A project's parts and what passes between them, as boxes and arrows: a row
 * where there's room, a column on phones. Plain text throughout, so it reads
 * in order to screen readers and search engines. Data: app/data/diagrams.ts.
 */
export default function SystemDiagram({ diagram }: { diagram: Diagram }) {
  return (
    <figure className={styles.diagram}>
      <figcaption className={styles.caption}>{diagram.title}</figcaption>
      <div className={styles.flow}>
        {diagram.nodes.map((node, i) => (
          <Fragment key={node.title}>
            <div className={styles.node}>
              <span className={styles.nodeTitle}>{node.title}</span>
              <span className={styles.nodeDetail}>{node.detail}</span>
            </div>
            {diagram.links[i] && i < diagram.nodes.length - 1 && <Link link={diagram.links[i]} />}
          </Fragment>
        ))}
      </div>
      {diagram.loop && (
        <div className={styles.loop}>
          <span className={styles.loopLine} aria-hidden="true" />
          <span className={styles.label}>{diagram.loop}</span>
        </div>
      )}
    </figure>
  );
}
