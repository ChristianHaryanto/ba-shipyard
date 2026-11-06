# Native interactions

All 63 HTML pages load assets/js/main.js. That runtime now loads assets/js/interactions.js automatically. The original source is unchanged.

## Appear / Disappear
fade, slide, flip, grow, grow-big, shrink, shrink-big, spin, fly, drop.

## Emphasis
pop, jiggle, pulse, blink, bounce, flip-left-to-right, flip-right-to-left, rubber-band, jello.

## Direction
up, down, left, right, up-left, up-right, down-left, down-right, center.

## Destination
center, top, bottom, left, right, top-left, top-right, bottom-left, bottom-right, custom.

## HTML
```html
<h2 data-chari-effect="slide" data-chari-trigger="scroll"
 data-chari-direction="up" data-chari-destination="center"
 data-chari-distance="80" data-chari-duration="800"
 data-chari-delay="100">Title</h2>
<button data-chari-effect="jello" data-chari-trigger="hover">Hover</button>
```

## JS
```js
ChariEffects.play(document.querySelector('.hero-title'), {
 effect: 'fade', direction: 'up', destination: 'center', duration: 800
});
```

Triggers: scroll, load, hover, click, manual (JS API).
Other options: distance, duration, delay, stagger, easing, repeat, customX, customY.
Reduced-motion preference is respected.

Important: presets are available but must be applied to elements explicitly. The separate original-events engine loads the extracted 759 original event definitions and 76 action lists. Full browser visual parity is NOT verified. Do not merge before real browser QA.
