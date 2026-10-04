/* Satark service worker.
   Goal: after one visit, the app opens and the check still works with no signal,
   because the rule engine runs inside the page. We never cache API calls, so nothing
   a person types is ever stored by this file. */

const VERSION = "satark-v2";
const SHARED = "satark-shared";
const SHELL = ["/", "/rules", "/trust", "/about", "/radar"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== SHARED).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// "Share to Satark" from another app. The text arrives as a POST. We keep it in a private
// cache for a moment, send the person to the home page, and the page picks it up and clears it.
async function takeShare(request) {
  try {
    const form = await request.formData();
    const parts = ["title", "text", "url"].map((k) => String(form.get(k) || "").trim()).filter(Boolean);
    const cache = await caches.open(SHARED);
    await cache.put("/shared-text", new Response(parts.join("\n")));
  } catch {
    // if reading fails the person just lands on the empty home page
  }
  return Response.redirect("/?shared=1", 303);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method === "POST" && url.origin === self.location.origin && url.pathname === "/share") {
    event.respondWith(takeShare(req));
    return;
  }

  // only our own pages and files, and never the API
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // pages: try the network first so people see the latest, fall back to what we saved
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/"))),
    );
    return;
  }

  // scripts, styles and images: serve the saved copy at once, refresh it in the background
  event.respondWith(
    caches.match(req).then((hit) => {
      const fresh = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || fresh;
    }),
  );
});
