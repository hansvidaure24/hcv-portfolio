// Plain constants (no React) so the server-rendered layout can import the
// pre-paint script. The hooks that read and write these live in preferences.ts.

export const TEXT_SPEED_KEY = "text-speed";
export const TIME_KEY = "time-of-day";
export const TEXT_FAST_HTML_CLASS = "text-fast";

/** Pre-paint: apply a stored "fast" text speed so intros never flash. */
export const TEXT_SPEED_BOOT_SCRIPT = `(function(){try{if(localStorage.getItem('${TEXT_SPEED_KEY}')==='fast')document.documentElement.classList.add('${TEXT_FAST_HTML_CLASS}');}catch(e){}})();`;
