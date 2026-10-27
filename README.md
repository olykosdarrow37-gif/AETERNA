# BEWARE THE MAN OF TOMORROW! – PC app (Windows)

## Build it on GitHub (no installs needed)

1. Create a new GitHub repository and upload **everything in this folder** (keep the `.github` folder).
2. Open the repo's **Actions** tab → **Build Windows App** → **Run workflow**
   (it also runs automatically on every push to `main`).
3. When it finishes (about 3–5 min), open the run and download **man-of-tomorrow-windows** from *Artifacts*.
4. Unzip it. You get:
   - `Man-of-Tomorrow-Setup-1.0.0.exe` – normal installer
   - `Man-of-Tomorrow-Portable-1.0.0.exe` – runs without installing

Windows may show a "SmartScreen" warning because the app isn't code-signed.
Click **More info → Run anyway**.

## Optional: public download link
Push a tag like `v1.0.0` and the `.exe` files get attached to a GitHub Release automatically.

## Run / test locally (optional)
```
npm install
npm start
```

The player itself lives in `www/index.html`. Edit it, push, and a new build is made.
