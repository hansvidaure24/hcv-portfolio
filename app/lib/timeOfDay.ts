// The site's one palette follows the visitor's local clock, like a handheld
// RPG's real-time clock. The boot script sets `data-time` on <html> before
// the first paint; globals.scss maps each value to a set of scenery colors.

export type TimeOfDay = "morning" | "day" | "dusk" | "night";

export const TIMES_OF_DAY: TimeOfDay[] = ["morning", "day", "dusk", "night"];

/** Morning 5–10, day 10–17, dusk 17–20, night 20–5. */
export function timeOfDayForHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

/**
 * Inline, pre-paint script. Order: `?time=dusk` in the URL (a preview, not
 * remembered), then a time picked in Options (localStorage "time-of-day"),
 * then the visitor's clock.
 */
export const TIME_BOOT_SCRIPT = `(function(){try{
var ok=['morning','day','dusk','night'];
var t=new URLSearchParams(location.search).get('time');
if(ok.indexOf(t)<0){try{t=localStorage.getItem('time-of-day');}catch(e){t=null;}}
if(ok.indexOf(t)<0){var h=new Date().getHours();
t=h>=5&&h<10?'morning':h>=10&&h<17?'day':h>=17&&h<20?'dusk':'night';}
document.documentElement.setAttribute('data-time',t);
}catch(e){}})();`;
