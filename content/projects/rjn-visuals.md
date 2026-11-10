A portfolio site for RJN Visuals, a photography and videography studio. It presents branded video work, wedding films and social campaigns, and takes booking inquiries.

## Problem
The studio needed one place to show its films and campaigns to new clients: a site that stays fast while full of video, reads well on a phone, and makes it easy to book.

The owner sent the content as a page-by-page brief. For each body of work (ScreenCrush, XXL, Golden Vows and social campaigns): a banner, one large film with the owner's role under it, a short intro, then a row of smaller videos, with the social reels side by side at the same size. The films came from three places: YouTube, Instagram and Google Drive.

## What I built
- A page for each body of work, laid out the way the brief described
- A wedding section with its own copy and films, and a Book Now button that leads to the contact form
- A home page listing the brands the studio has worked with, and an About page
- A contact form that emails the studio directly, with no backend to run

## Key decisions
**The wedding films play from the site, not from Drive.** They arrived as Google Drive files. I re-encoded each one for the web and served it from the site itself. A film fetches only its details until someone presses play, and its preview starts a second in, so it doesn't open on a black frame.

**Embeds that load when needed.** YouTube films use YouTube's privacy-enhanced player, load only as they near the screen, and run sandboxed. Instagram's embed script loads once, after the rest of the page, and fills in every reel.

## What was hard
**A 29-minute film and a 100 MB limit.** The films live in the site's repository, so they deploy with it and there is nothing else to host. The cost is GitHub's 100 MB limit per file: the longest film went out at 720p, the rest at 1080p.

## Built with
Next.js 16 (App Router), React 19, TypeScript, SCSS Modules, EmailJS, Instagram embed widget, Vercel.
