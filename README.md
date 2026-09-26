# Fitness Game Settings Update v4

## Changes
- Backgrounds are image-only; no video upload system.
- Background thumbnails use Electron file URLs, so images stored in `public/background` display reliably.
- Upload/replace and delete background images still use the fixed project filenames for each landscape/portrait slot.
- Uploaded fonts can be selected, applied, and deleted.
- Font selection updates `public/css/global.css` and `--font-family`.
- Font and color changes are pushed live to every open Electron renderer through `preload.js`; pages do not need to be closed/reopened.
- Background CSS variables are also pushed live.
- Original game results remain in `public/results/result.xlsx`.
- Exported Excel copies are stored OUTSIDE the project at:
  `Documents/WordGame/`
- Delete Exported Results removes only `.xlsx` files from that external folder.
