# Put the Artikel-Trainer on your Android phone and tablet

The app is an installable web app (PWA). You put the folder online once (free), then install it from Chrome on each device.
Once installed it has its own icon, opens full screen and **works offline**.

## 1. Put the folder online (choose one)

### Option A: GitHub Pages (free, permanent)
1. Create a free account at <https://github.com> (skip this if you already have one).
2. Click **+ → New repository**. Name: `learn-german`. Visibility: **Public** (free GitHub Pages needs a public repository). Click **Create repository**.
3. On the new repository page, click **uploading an existing file**. Drag in **everything inside** the `learn-german` folder
   (`index.html`, `sw.js`, `manifest.webmanifest` and the folders `css`, `js`, `vendor`, `fonts`, `icons`, `docs`, `scripts`). Click **Commit changes**.
4. Open **Settings → Pages**. Under "Build and deployment", set **Source: Deploy from a branch**, **Branch: main / (root)**, then **Save**.
5. After 1–2 minutes the link appears at the top of that page, e.g. `https://YOUR-NAME.github.io/learn-german/`.

### Option B: Netlify (free, drag and drop)
1. Create a free account at <https://app.netlify.com>.
2. Open <https://app.netlify.com/drop> and drag the whole `learn-german` folder onto the page.
3. You get a link like `https://something-random.netlify.app` (you can rename it under **Site configuration → Change site name**).

## 2. Install on the phone and tablet
1. Open the link in **Chrome**.
2. Tap the **📲 Installieren · Install** button at the top of the app, or Chrome's menu **⋮ → Install app** (on some phones: **Add to Home screen → Install**).
3. The **der die das** icon appears on the home screen. Open it once while online; after that it works offline.

## 3. German voice (one-time, per device)
Pronunciation uses Android's built-in text-to-speech. If words are read with an English accent:
**Settings → search "Text-to-speech" → Preferred engine: Speech Services by Google → ⚙ → Install voice data → Deutsch (Deutschland)**.
Then choose the voice in the app with the 🔊 menu at the top.

## 4. Updating the app later
1. After changing any file, run: `python3 scripts/update_version.py`
   (it gives the files a new version number so the installed apps download the update).
2. Upload the changed files again (GitHub: **Add file → Upload files**, same names overwrite; Netlify: **Deploys → drag the folder again**).
3. The next time the app is opened while online it downloads the update and shows
   "Update geladen – beim nächsten Öffnen aktiv". Close and reopen the app to use it.

## Good to know
- Everything the kids do (scores, settings, added words) stays on each device. Nothing is sent anywhere.
- Words added with the Excel upload are saved per device. Use **Exportieren** on one device and upload the file on the other to copy them.
- The link is public but not listed anywhere. Only people you give it to will find it.
- Opening `index.html` directly on a computer still works too (just without offline install).
