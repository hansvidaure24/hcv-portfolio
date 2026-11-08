import styles from "./VideoToggle.module.scss";

type VideoToggleProps = {
  paused: boolean;
  /** What's playing, for screen readers: "Pause {label}". */
  label: string;
  onToggle: () => void;
};

/** Pauses a clip that plays on its own. Place it inside a positioned frame. */
export default function VideoToggle({ paused, label, onToggle }: VideoToggleProps) {
  return (
    <button type="button" className={styles.toggle} onClick={onToggle} aria-label={`${paused ? "Play" : "Pause"} ${label}`}>
      {paused ? "Play" : "Pause"}
    </button>
  );
}
