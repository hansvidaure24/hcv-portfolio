// Keep the sound preference at module scope so all callers share it.
let soundEnabled = true;

let backgroundMusic: HTMLAudioElement | null = null;
let backgroundFadeTimer: ReturnType<typeof setInterval> | null = null;

function clearBackgroundFade() {
  if (backgroundFadeTimer) {
    clearInterval(backgroundFadeTimer);
    backgroundFadeTimer = null;
  }
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (!enabled) stopBackgroundMusic();
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function playSound(src: string, volume = 1) {
  if (!soundEnabled) return;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
}

export function startBackgroundMusic(src = "/sounds/pokemon-bgmusic.mp3", volume = 0.25) {
  if (!soundEnabled || typeof window === "undefined") return;

  if (!backgroundMusic) {
    backgroundMusic = new Audio(src);
    backgroundMusic.loop = true;
    backgroundMusic.preload = "auto";
  }

  clearBackgroundFade();
  backgroundMusic.volume = 0;
  backgroundMusic.play().catch(() => {});

  let currentVolume = 0;
  backgroundFadeTimer = setInterval(() => {
    currentVolume = Math.min(volume, currentVolume + volume / 12);
    if (backgroundMusic) backgroundMusic.volume = currentVolume;
    if (currentVolume >= volume) clearBackgroundFade();
  }, 50);
}

export function stopBackgroundMusic() {
  if (!backgroundMusic) return;

  clearBackgroundFade();
  const audio = backgroundMusic;
  const startingVolume = audio.volume;
  let currentVolume = startingVolume;
  backgroundFadeTimer = setInterval(() => {
    currentVolume = Math.max(0, currentVolume - Math.max(startingVolume / 8, 0.01));
    audio.volume = currentVolume;
    if (currentVolume <= 0) {
      clearBackgroundFade();
      audio.pause();
      audio.currentTime = 0;
    }
  }, 50);
}

// Attach one early listener so audio callers can wait for the first gesture.
let firstGesturePromise: Promise<void> | null = null;

export function getFirstGesturePromise(): Promise<void> {
  if (firstGesturePromise) return firstGesturePromise;

  firstGesturePromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;
    function onGesture() {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      resolve();
    }
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
  });

  return firstGesturePromise;
}
