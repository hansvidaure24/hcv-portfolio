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

/** Called by MorphWatcher once the new route has rendered. */
export function resolvePendingMorph() {
  const resolve = pendingResolve;
  pendingResolve = null;
  resolve?.();
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
