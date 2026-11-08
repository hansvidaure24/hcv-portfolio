import Link from "next/link";
import TopBar from "./components/navigation/TopBar";
import PixelPanel from "./components/ui/PixelPanel";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <main className={styles.wrap}>
      <TopBar />
      <PixelPanel title="ERR 404" titleAs="div" className={styles.panel} bodyClassName={styles.body}>
        <h1 className={styles.title}>Route not found</h1>
        <p className={styles.text}>
          You&apos;ve wandered off the map. There&apos;s no area here: the path you followed doesn&apos;t lead
          anywhere on this route.
        </p>
        <Link href="/" className={styles.homeLink}>
          Back to the start <span aria-hidden="true">▶</span>
        </Link>
      </PixelPanel>
    </main>
  );
}
