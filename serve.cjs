/* Static server + auto-open untuk index.html.
 *
 *   node serve.cjs              # layani folder ini lalu buka browser
 *   node serve.cjs --no-open    # layani saja, jangan buka browser
 *   PORT=3000 node serve.cjs    # port lain
 *
 * Server ini sengaja TIDAK kembali ke prompt — itu artinya dia jalan.
 * Tekan Ctrl+C untuk menghentikannya.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8137;
const AUTO_OPEN = !process.argv.includes("--no-open");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const listen = (port, triesLeft) => {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
    const file = path.join(ROOT, rel);

    // jangan keluar dari folder ini
    if (!file.startsWith(ROOT)) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("403");
      return;
    }

    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("404 — " + rel);
        return;
      }
      res.writeHead(200, {
        "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(buf);
    });
  });

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && triesLeft > 0) {
      console.log("port " + port + " dipakai, coba " + (port + 1) + "…");
      listen(port + 1, triesLeft - 1);
      return;
    }
    console.error("gagal start:", err.message);
    process.exit(1);
  });

  server.listen(port, "127.0.0.1", () => {
    const url = "http://127.0.0.1:" + port + "/";
    console.log("");
    console.log("  KIMI — GRIDO1 Racing Systems");
    console.log("  Serving " + ROOT);
    console.log("  " + url);
    console.log("");
    console.log("  Server berjalan. Buka URL itu di browser.");
    console.log("  Tekan Ctrl+C dua kali untuk stop.");
    console.log("");
    if (AUTO_OPEN) {
      const cmd =
        process.platform === "win32"
          ? 'start "" "' + url + '"'
          : process.platform === "darwin"
            ? 'open "' + url + '"'
            : 'xdg-open "' + url + '"';
      exec(cmd, () => {});
    }
  });
};

listen(PORT, 10);