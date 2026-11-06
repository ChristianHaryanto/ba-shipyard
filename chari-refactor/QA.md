# Native migration implementation and QA status

Branch: `refactor/chari-native-css-js`.

## Changes
- All 63 refactor HTML routes migrated from Webflow `w-*` class tokens to `chari-*` or `is-*` states.
- Interaction `data-w-id` attributes migrated to unique `id` where possible. Existing IDs remain intact; collision cases use `data-chari-interaction-id` and the native runtime targets both.
- Inline Webflow style selectors migrated, including interaction targets.
- Main component JavaScript, extracted interactions and CSS selectors updated consistently.
- 13 duplicate IDs in legacy page markup assigned unique suffixes; CSS grid selectors updated for repeated grid IDs.
- Native animation presets and extracted event/action-list payload retained.
- Added static verification and Playwright browser QA scripts, with GitHub Actions workflow.

## Evidence and limitations
- Browser automation has **not yet completed**. Workflow will execute on branch push; inspect its result before declaring QA-ready.
- Visual regression against `chari-128/` and interaction-specific automated assertions remain incomplete.
- The source `chari-128/` was not edited by these commits.
- Do not mark Done or claim visual parity until browser QA and original-vs-refactor screenshot comparison pass.

## Commands
```sh
node scripts/verify-chari-native.mjs
node scripts/chari-browser-qa.mjs
```
Browser QA requires `@playwright/test` and Chromium. The GitHub Actions workflow provisions these automatically.
