import styles from "./SectionHeading.module.scss";

type SectionHeadingProps = {
  children: React.ReactNode;
  id?: string;
  as?: "h1" | "h2";
};

/**
 * The wooden route sign every section uses as its heading. It sits at the
 * start of the section's content column; phones get a compact version.
 */
export default function SectionHeading({ children, id, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className={styles.sign}>
      <Tag id={id} className={styles.text}>
        {children}
      </Tag>
    </div>
  );
}
