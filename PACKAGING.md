# 📦 RewardXtra — Packaging Guide

Web Store ke liye clean zip banane ka tareeka. Sirf runtime files include karo —
tests, docs, dev scripts, aur purane Quick Notes files exclude.

## ✅ Include (extension runtime)
```
manifest.json
popup-smartcard.html
popup-smartcard.js
background.js
content-detect.js
recommend.js
captracker.js
reminders.js
offers.js
affiliate.js
premium.js
privacy.html
data/cards.json
icon16.png
icon48.png
icon128.png
```

## ❌ Exclude (dev only)
```
*.test.js              run-all-tests.js      generate-icons.js
package.json           README.md             STORE.md
PACKAGING.md           PRIVACY.md            plan.md
data/SOURCES.md        popup.html            popup.js   (purana Quick Notes)
.git/                  node_modules/
```

## 🛠️ Build zip (PowerShell, Windows)
```powershell
$include = @(
  'manifest.json','popup-smartcard.html','popup-smartcard.js','background.js',
  'content-detect.js','recommend.js','captracker.js','reminders.js','offers.js',
  'affiliate.js','premium.js','privacy.html','icon16.png','icon48.png','icon128.png'
)
$dist = 'dist'
Remove-Item $dist -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory $dist | Out-Null
New-Item -ItemType Directory "$dist\data" | Out-Null
$include | ForEach-Object { Copy-Item $_ "$dist\$_" }
Copy-Item 'data\cards.json' "$dist\data\cards.json"
Compress-Archive -Path "$dist\*" -DestinationPath 'smartcard-saver.zip' -Force
Write-Host 'smartcard-saver.zip ready ✓'
```

## 🔍 Before zipping
1. `npm test` — saare 87 tests green
2. `affiliate.js` mein real affiliate IDs daale
3. `manifest.json` + `package.json` version match
4. `data/cards.json` reward data re-verified
5. Real checkout pe widget + bill notification verify

> Tip: zip ko ek baar `chrome://extensions` → Load unpacked se `dist/` folder load karke
> test karo, taaki confirm ho saare referenced files included hain.
