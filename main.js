const { app, BrowserWindow, shell, Menu, session } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, 'www');
const PREFERRED_PORT = 47831; // fixed so saved data (localStorage/IndexedDB) survives restarts

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Tiny local web server. Serving over http://127.0.0.1 (instead of file://)
// gives embedded players (YouTube etc.) a proper origin so they work.
function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.normalize(path.join(WWW, urlPath));
    if (!filePath.startsWith(WWW)) { res.writeHead(403); return res.end(); }
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
      });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    const tryListen = (port) => {
      server.once('error', () => { if (port !== 0) tryListen(0); });
      server.listen(port, '127.0.0.1', () => resolve(server.address().port));
    };
    tryListen(PREFERRED_PORT);
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let win;
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

  app.whenReady().then(async () => {
    const port = await startServer();
    Menu.setApplicationMenu(null);

    // Allow the permissions the player may ask for (clipboard, fullscreen, media, etc.)
    session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(true));

    win = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 480,
      minHeight: 600,
      backgroundColor: '#1b110c',
      title: 'BEWARE THE MAN OF TOMORROW!',
      icon: path.join(__dirname, 'www', 'icon-512.png'),
      autoHideMenuBar: true,
      webPreferences: { contextIsolation: true, nodeIntegration: false }
    });

    // Open normal web links in the user's browser, not inside the app
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (/^https?:/i.test(url)) shell.openExternal(url);
      return { action: 'deny' };
    });

    win.loadURL(`http://127.0.0.1:${port}/index.html`);
  });

  app.on('window-all-closed', () => app.quit());
}
