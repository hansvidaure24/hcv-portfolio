// Card → case-study morph with the View Transitions API and Next's client
// router. The browser snapshots the old page, we navigate, and the snapshot
// of the new page is taken once the new route has rendered (MorphWatcher
// resolves the promise when the pathname changes). Elements that share a
// `view-transition-name` on both pages (the cover and the title) morph.

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => unknown;
};

let pendingResolve: (() => void) | null = null;

export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && typeof (document as ViewTransitionDocument).startViewTransition === "function";
}

/**
 * Called by MorphWatcher once the new route has rendered (`arrived`), or by
 * the timeout below if it never does. On arrival the case study starts at
 * its top: Next resets the scroll on its own outside a view transition, but
 * from Next 16 not inside one, so the page opened wherever the home page had
 * been scrolled to. Done before the new snapshot, so the morph lands there.
 */
export function resolvePendingMorph(arrived = false) {
  const resolve = pendingResolve;
  pendingResolve = null;
  if (!resolve) return;
  if (arrived && !window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  resolve();
}

/** Runs `navigate` inside a view transition. Returns false if the browser can't. */
export function morphTo(navigate: () => void): boolean {
  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition) return false;

  let navigated = false;
  const go = () => {
    if (navigated) return;
    navigated = true;
    navigate();
  };

  doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        pendingResolve = resolve;
        go();
        // Never leave the page frozen on the old snapshot if the route doesn't change.
        window.setTimeout(() => {
          if (pendingResolve === resolve) resolvePendingMorph();
        }, 2000);
      })
  );
  // The transition only starts after the browser paints a frame. If it hasn't
  // (a background tab, a stalled renderer), navigate anyway: the link must work.
  window.setTimeout(go, 1000);
  return true;
}

/** Shared names, so the card and the case-study page pair up. */
export const morphNames = {
  media: (slug: string) => `project-media-${slug}`,
  title: (slug: string) => `project-title-${slug}`,
};
