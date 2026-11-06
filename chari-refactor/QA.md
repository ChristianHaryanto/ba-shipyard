# Chari Refactor — QA Gate

This directory is an isolated migration of the 63 static pages in `../chari-128/`. The original directory must remain unchanged.

## Architecture
All HTML pages load `assets/css/style.css` and `assets/js/main.js` exactly once. Fonts and images are local. Original CSS class names remain to preserve layout compatibility; the native JS does not load the old vendor runtime.

## Source-level verification completed
- 63 HTML pages present.
- One CSS and one JS reference per HTML page.
- All relative `href`, `src`, `poster`, and `srcset` references resolve to repository assets or directory index pages.
- All stylesheet `url(...)` references resolve to repository assets.
- Shared JS compiles successfully.

## Browser QA required before merging
Compare `chari-128` and `chari-refactor` under the same local HTTP server, browser, device scale and viewport.

- Viewports: 1440, 1280, 991, 768, 390 and 375px.
- Screenshot comparison: home, home-2, home-3, about-us, blog and article, causes and cause detail, projects and project detail, events and event detail, FAQ, contact-us, career, and 404.
- Inspect all 63 routes for console errors, missing assets/fonts, horizontal overflow, responsive image sizes and broken internal links.
- Test navigation, dropdowns, mobile menu, Enter/Space/Escape, carousel arrows/dots/autoplay/swipe/resize, FAQ accordions, tabs, lightbox and reduced motion.
- Compare hover transitions, scroll animations and timing against the original. Native motion is not yet a proven exact reproduction of the original timeline.
- Forms require a configured backend; never treat a placeholder message as a successful submission.

**Acceptance status: pending real browser regression and pixel comparison. Do not merge into main before QA passes.**
