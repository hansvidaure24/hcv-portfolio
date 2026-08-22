import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className={styles.panel} role="alert">
        <p className={styles.routeCode} aria-hidden="true">▰▰▰▱▱▱▱▱▱▱ ERR_404</p>
        <h1 className={styles.title}>ROUTE NOT FOUND</h1>
        <p className={styles.body}>
          You&apos;ve wandered off the map. There&apos;s no area here — the path you followed
          doesn&apos;t lead anywhere on this route.
        </p>
        <Link href="/" className={styles.homeLink}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}
