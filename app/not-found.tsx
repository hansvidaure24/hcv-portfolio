import Link from "next/link";
import TopBar from "./components/navigation/TopBar";
import PixelPanel from "./components/ui/PixelPanel";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <>
      <TopBar />
      <main className={styles.wrap}>
        <PixelPanel title="ERR 404" titleAs="div" className={styles.panel} bodyClassName={styles.body}>
          <h1 className={styles.title}>Route not found</h1>
          <p className={styles.text}>You&apos;ve wandered off the map.</p>
          <Link href="/" className={styles.homeLink}>
            Back to the start <span aria-hidden="true">▶</span>
          </Link>
        </PixelPanel>
      </main>
    </>
  );
}
