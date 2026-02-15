const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const assetsDir = path.join(projectRoot, "assets");
const indexHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(distDir)) {
  console.error("dist folder not found. Run web export first.");
  process.exit(1);
}

if (!fs.existsSync(indexHtmlPath)) {
  console.error("dist/index.html not found. Run web export first.");
  process.exit(1);
}

const iconSrc = path.join(assetsDir, "icon.png");
const maskableIconSrc = path.join(assetsDir, "adaptive-icon.png");
const iconOut = path.join(distDir, "pwa-icon-1024.png");
const maskableIconOut = path.join(distDir, "pwa-maskable-1024.png");

if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, iconOut);
}

if (fs.existsSync(maskableIconSrc)) {
  fs.copyFileSync(maskableIconSrc, maskableIconOut);
}

const manifest = {
  name: "WellnessMate",
  short_name: "WellnessMate",
  description: "Track workouts, diet plans, and wellness progress.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#0f172a",
  theme_color: "#0f172a",
  icons: [
    {
      src: "/pwa-icon-1024.png",
      sizes: "1024x1024",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/pwa-maskable-1024.png",
      sizes: "1024x1024",
      type: "image/png",
      purpose: "maskable"
    }
  ]
};

fs.writeFileSync(
  path.join(distDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

const serviceWorker = `const CACHE_NAME = "wellnessmate-cache-v1";
const ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
`;

fs.writeFileSync(path.join(distDir, "sw.js"), serviceWorker, "utf8");

let html = fs.readFileSync(indexHtmlPath, "utf8");

if (!html.includes('rel="manifest"')) {
  const headInsert = `
    <meta name="theme-color" content="#0f172a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="WellnessMate" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/pwa-icon-1024.png" />`;
  html = html.replace("</head>", `${headInsert}\n  </head>`);
}

if (!html.includes("navigator.serviceWorker.register")) {
  const swRegister = `
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("/sw.js").catch(function () {});
        });
      }
    </script>`;
  html = html.replace("</body>", `${swRegister}\n</body>`);
}

fs.writeFileSync(indexHtmlPath, html, "utf8");
console.log("PWA files generated in dist/");
